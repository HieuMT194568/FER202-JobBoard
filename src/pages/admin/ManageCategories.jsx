import { useEffect, useState } from 'react'
import { Table, Button, Spinner, Card, Form, InputGroup, Alert } from 'react-bootstrap'
import { categoryApi, jobApi } from '../../api/services'
import ConfirmModal from '../../components/ConfirmModal'

function ManageCategories() {
  const [categories, setCategories] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editing, setEditing] = useState(null) // { id, name }
  const [deleting, setDeleting] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([categoryApi.getAll(), jobApi.getAll()])
      .then(([cats, jobData]) => {
        setCategories(cats)
        setJobs(jobData)
      })
      .finally(() => setLoading(false))
  }, [])

  const isDuplicate = (name, exceptId) =>
    categories.some((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase())

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return setError('Tên ngành nghề không được để trống')
    if (isDuplicate(name)) return setError('Ngành nghề đã tồn tại')
    const created = await categoryApi.create({ name })
    setCategories([...categories, created])
    setNewName('')
    setError('')
  }

  const handleSaveEdit = async () => {
    const name = editing.name.trim()
    if (!name) return setError('Tên ngành nghề không được để trống')
    if (isDuplicate(name, editing.id)) return setError('Ngành nghề đã tồn tại')
    const updated = await categoryApi.update(editing.id, { name })
    setCategories(categories.map((c) => (c.id === updated.id ? updated : c)))
    setEditing(null)
    setError('')
  }

  const countJobs = (id) => jobs.filter((j) => j.categoryId === id).length

  const askDelete = (c) => {
    if (countJobs(c.id) > 0) return setError(`Không thể xóa "${c.name}" vì đang có tin tuyển dụng thuộc ngành này`)
    setDeleting(c)
  }

  const handleDelete = async () => {
    await categoryApi.remove(deleting.id)
    setCategories(categories.filter((c) => c.id !== deleting.id))
    setDeleting(null)
  }

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )

  return (
    <>
      <h3 className="mb-3">Quản lý ngành nghề</h3>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      <Form onSubmit={handleAdd} className="mb-3">
        <InputGroup style={{ maxWidth: 500 }}>
          <Form.Control placeholder="Tên ngành nghề mới" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Button type="submit">
            <i className="bi bi-plus-lg" /> Thêm
          </Button>
        </InputGroup>
      </Form>

      <Card className="shadow-sm">
        <Table hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Tên ngành nghề</th>
              <th className="text-center">Số tin</th>
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  {editing?.id === c.id ? (
                    <Form.Control
                      size="sm"
                      autoFocus
                      value={editing.name}
                      onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="text-center">{countJobs(c.id)}</td>
                <td className="text-end">
                  {editing?.id === c.id ? (
                    <>
                      <Button size="sm" variant="success" className="me-1" onClick={handleSaveEdit}>
                        Lưu
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline-secondary" className="me-1" onClick={() => setEditing({ ...c })}>
                        <i className="bi bi-pencil" /> Sửa
                      </Button>
                      <Button size="sm" variant="outline-danger" onClick={() => askDelete(c)}>
                        <i className="bi bi-trash" /> Xóa
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <ConfirmModal
        show={!!deleting}
        message={`Xóa ngành nghề "${deleting?.name}"?`}
        onConfirm={handleDelete}
        onHide={() => setDeleting(null)}
      />
    </>
  )
}

export default ManageCategories
