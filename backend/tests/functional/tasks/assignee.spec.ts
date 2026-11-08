import User from '#models/user'
import Task from '#models/task'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito homónimo de `openspec/specs/tasks/spec.md`.
 *
 * Cada scenario se comprueba en las dos lecturas de una tarea —la lista y la
 * tarea suelta— porque cada una se serializa con un transformer distinto, y
 * que una cumpla no dice nada de la otra.
 *
 * Quien mira y quien es responsable son cuentas distintas a propósito: así lo
 * que llega en `assignee` no puede venir de la sesión de quien pregunta.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  const HOY = '2026-11-08'

  async function sesion(client: any) {
    await User.create({
      fullName: 'Grace Hopper',
      email: 'grace@example.com',
      password: 'secreto123',
    })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'grace@example.com', password: 'secreto123' })

    return response.body().data.token as string
  }

  async function tareaDe(fullName: string | null, email: string) {
    const responsable = await User.create({ fullName, email, password: 'secreto123' })
    return Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: responsable.id,
    })
  }

  /** El `assignee` de la tarea tal como llega en la lista y suelta. */
  async function responsables(client: any, token: string, taskId: number) {
    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)
    lista.assertStatus(200)

    const enLista = lista.body().data.find((t: any) => t.id === taskId)

    const suelta = await client
      .get(`/api/v1/tasks/${taskId}`)
      .qs({ today: HOY })
      .header('Authorization', `Bearer ${token}`)
    suelta.assertStatus(200)

    return { lista: enLista?.assignee, suelta: suelta.body().data.assignee }
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const assignee = await responsables(client, token, tarea.id)

    for (const [lectura, responsable] of Object.entries(assignee)) {
      assert.isObject(responsable, `${lectura}: falta el assignee`)
      assert.equal(responsable.fullName, 'Ada Lovelace', `${lectura}: nombre`)
      assert.equal(responsable.initials, 'AL', `${lectura}: iniciales`)
    }
  })

  test('el responsable de una tarea no expone el email ni datos de acceso', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const assignee = await responsables(client, token, tarea.id)

    for (const [lectura, responsable] of Object.entries(assignee)) {
      assert.isObject(responsable, `${lectura}: falta el assignee`)
      assert.notProperty(responsable, 'email', `${lectura}: expone el email`)
      assert.notProperty(responsable, 'password', `${lectura}: expone la contraseña`)

      // No basta con que no haya un campo `email`: el valor no debe aparecer
      // bajo ningún otro nombre.
      const serializado = JSON.stringify(responsable)
      assert.notInclude(serializado, 'ada@example.com', `${lectura}: el email aparece`)
      assert.notInclude(serializado, 'secreto123', `${lectura}: la contraseña aparece`)
    }
  })

  test('un responsable sin nombre llega con el nombre nulo y con iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe(null, 'sin-nombre@example.com')

    const assignee = await responsables(client, token, tarea.id)

    for (const [lectura, responsable] of Object.entries(assignee)) {
      assert.isObject(responsable, `${lectura}: falta el assignee`)
      assert.property(responsable, 'fullName', `${lectura}: falta el campo del nombre`)
      assert.isNull(responsable.fullName, `${lectura}: el nombre no llega nulo`)
      assert.isString(responsable.initials, `${lectura}: faltan las iniciales`)
      assert.isNotEmpty(responsable.initials, `${lectura}: iniciales vacías`)
    }
  })
})
