import { useState, useEffect } from 'react'
import { Button, Modal } from 'react-bootstrap'
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Select from 'react-select'
import { format } from 'date-fns'
import { BsPlus, BsTrash, BsPencil } from "react-icons/bs";
import { useForm } from "react-hook-form"

// Firebase
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

if (firebase.apps.length === 0) {
  firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    databaseUrl: process.env.REACT_APP_DATABASE_URL,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
  })
}
const firestore = firebase.firestore()
const auth = firebase.auth()


// const data = require('./sampleData.json')

const categories = [
  { catId: 0, name: '-- All --' },
  { catId: 1, name: 'Food' },
  { catId: 2, name: 'Fun' },
  { catId: 3, name: 'Transportation' },
]

export default function Journal() {
  const [category, setCategory] = useState()
  const { register, handleSubmit } = useForm()
  const [showForm, setShowForm] = useState(false)
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [tempData, setTempData] = useState({
    id: null,
    createdAt: new Date(),
    description: '',
    amount: 0,
    category: categories[0]
  })

  // Firebase stuff
  const categoryRef = firestore.collection('Category');
  const query_category = categoryRef.orderBy('catId', 'asc').limitToLast(100);
  const [cate] = useCollectionData(query_category, { idField: 'id' });
  const moneyRef = firestore.collection('money');
  const query = moneyRef.orderBy('createdAt', 'asc').limitToLast(100);
  const [data] = useCollectionData(query, { idField: 'id' });

  console.log("REACT_APP_PROJECT_ID", process.env.REACT_APP_PROJECT_ID)

  // This will be run when 'data' is changed.
  useEffect(() => {
    if (data) {
      if (cate) { // Guard condition
        let t = 0
        let r = data.map((d, i) => {
          let catName= "Uncategorize"
          //looping through the data from category to find the matching catId and categoryId to get the name
          cate.map((c) =>{
            if(c.catId === d.categoryId){
              catName = c.name
            }
          })
          t += d.amount
          return (
            <JournalRow
              cate={catName}
              data={d}
              i={i}
              onDeleteClick={handleDeleteClick}
              onEditClick={handleEditClick}
            />
          )
        })

        setRecords(r)
        setTotal(t)
      }
  }
  },
    [data], [cate])



  const handleCategoryFilterChange = (obj) => {
    console.log('filter', obj)
    if (data) { // Guard condition      
      let t = 0
      let filteredData = data.filter(d => obj.catId == 0 || d.categoryId == obj.catId)
      let r = filteredData.map((d, i) => {
        let catName= "Uncategorize"
        console.log('filter', d)
        t += d.amount
        cate.map((c) =>{
          if(c.catId === d.categoryId){
            catName = c.name
          }
        })
        return (
          <JournalRow data={d} i={i} cate={catName}/>
        )
      })

      setRecords(r)
      setTotal(t)
    }
  }


  // Handlers for Modal Add Form
  //add 2
  const handleshowForm = () => setShowForm(true)

  // Handlers for Modal Add Form
  const handleCloseForm = () => {
    setTempData({
      id: null,
      createdAt: new Date(),
      description: '',
      amount: 0,
      category: categories[0]
    })
    setCategory({})
    setShowForm(false)
    setEditMode(false)
  }

  // Handle Add Form submit
  const onSubmit = async (data) => {
    let preparedData = {
      // ...data,
      description: data.description,
      amount: parseFloat(data.amount),
      createdAt: new Date(data.createdAt),
      categoryId: parseFloat(category.catId),
      // category: category

    }
    console.log('onSubmit', preparedData)

    //add 2.5
    if (editMode) {
      // Update record
      console.log("UPDATING!!!!", data.id)
      await moneyRef.doc(data.id)
        .set(preparedData)
        .then(() => console.log("moneyRef has been set"))
        .catch((error) => {
          console.error("Error: ", error);
          alert(error)
        });
    } else {
      // Add to firebase
      // This is asynchronous operation, 
      // JS will continue process later, so we can set "callback" function
      // so the callback functions will be called when firebase finishes.
      // Usually, the function is called "then / error / catch".

      //add 3
      await moneyRef
        .add(preparedData)
        .then(() => console.log("New record has been added."))
        .catch((error) => {
          console.error("Errror:", error)
          alert(error)
        })
      // setShowForm(false)
    }
    handleCloseForm()
  }

  const handleCategoryChange = (obj) => {
    console.log('handleCategoryChange', obj)
    setCategory(obj)
  }

  const handleDeleteClick = (id) => {
    console.log('handleDeleteClick in Journal', id)
    if (window.confirm("Are you sure to delete this record?"))
      moneyRef.doc(id).delete()
  }

  const handleEditClick = (data) => {
    let preparedData = {
      id: data.id,
      description: data.description,
      amount: parseFloat(data.amount),
      createdAt: data.createdAt.toDate(),
      categoryId: data.catId,
      //category: category
    }
    console.log("handleEditClick", preparedData)
    // expect original data type for data.createdAt is Firebase's timestamp
    // convert to JS Date object and put it to the same field
    // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
    //   data.createdAt = data.createdAt.toDate()

    setTempData(preparedData)
    setCategory(data.category)
    setShowForm(true)
    setEditMode(true)
  }


  return (
    <Container>
      <Row>
        <Col>
          <h1>Journal</h1>
          {/* add 1 */}
          <Button variant="outline-dark" onClick={handleshowForm}>
            <BsPlus /> Add
      </Button>
        </Col>
        <Col>
          Category:
          <Select
            options={cate}
            getOptionLabel={x => x.name}
            getOptionValue={x => x.id}
            onChange={handleCategoryFilterChange}
          />
        </Col>

      </Row>

      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {records}
        </tbody>
        <tfooter>
          <td colSpan={5}>
            <h2>Total: {total}</h2>
          </td>
        </tfooter>
      </Table>


      <Modal
        show={showForm} onHide={handleCloseForm}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <form onSubmit={handleSubmit(onSubmit)}>
        <input
            type="hidden"
            placeholder="ID"
            ref={register}
            name="id"
            id="id"
            defaultValue={tempData.id}
          />
          <Modal.Header closeButton>
            <Modal.Title>
              {editMode ? "Edit Record" : "Add New Record"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col>
                <label htmlFor="createdAt">Date</label>
              </Col>
              <Col>
                <input
                  type="date"
                  placeholder="Date"
                  ref={register({ required: true })}
                  name="createdAt"
                  id="createdAt"
                  defaultValue={format(tempData.createdAt, "yyyy-MM-dd")}
                />

              </Col>
            </Row>

            <Row>
              <Col>
                <label htmlFor="categoryId">Category</label>
              </Col>
              <Col>
                <Select
                  id="categoryId"
                  name="categoryId"
                  value={category}
                  placeholder="Category"
                  options= {cate ? cate.filter(c => c.catId != 0): categories}
                  onChange={handleCategoryChange}
                  getOptionLabel={x => x.name}
                  getOptionValue={x => x.catId}
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <label htmlFor="description">Description</label>
              </Col>
              <Col>
                <input
                  type="text"
                  placeholder="Description"
                  ref={register({ required: true })}
                  name="description"
                  id="description"
                  defaultValue={tempData.description}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <label htmlFor="amount">Amount</label>
              </Col>
              <Col>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Amount"
                  ref={register({ required: true })}
                  name="amount"
                  id="amount"
                  defaultValue={tempData.amount}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseForm}>
              Close
          </Button>
            <Button variant={editMode ? "success" : "primary"} type="submit">
              {editMode ? "Save Record" : "Add Record"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>
  )
}

function JournalRow(props) {
  let c = props.cate
  let d = props.data
  let i = props.i
  // console.log("JournalRow", d)
  return (
    <tr>
      <td>
        <BsTrash onClick={() => props.onDeleteClick(d.id)} />
        <BsPencil onClick={() => props.onEditClick(d)} />
      </td>
      <td>{format(d.createdAt.toDate(), "yyyy-MM-dd")}</td>
      <td>{d.description}</td>
      <td>{c}</td>
      <td>{d.amount}</td>
    </tr>
  )
}