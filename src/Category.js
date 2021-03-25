import {BsPlus, BsTrash, BsPencil } from "react-icons/bs";
import { useState, useEffect } from 'react'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button, Modal } from 'react-bootstrap'

// Firebase
import { useCollectionData } from 'react-firebase-hooks/firestore';
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import { Container, Table } from 'react-bootstrap'
import { useForm } from "react-hook-form"

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



export default function Category() {

  const [records, setRecords] = useState([])
  const [categoryList, setCategoryList] = useState([])
  const moneyRef = firestore.collection('money');
  const query = moneyRef.orderBy('createdAt', 'asc').limitToLast(100);
  const [data] = useCollectionData(query, { idField: 'id' });
  const categoryRef = firestore.collection('Category');
  const query_category = categoryRef.orderBy('catId', 'asc').limitToLast(100);
  const [cate] = useCollectionData(query_category, { idField: 'id' });

  const [showForm, setShowForm] = useState(false)
  const { register, handleSubmit } = useForm()
  const [editMode, setEditMode] = useState(false)
  const [tempData, setTempData] = useState({
    name: null,
  })

  const handleCloseForm = () => {
    setTempData({
      catId:null,
      name:null,
    })
    setShowForm(false)
    setEditMode(false)
  }

  // useEffect(() => {
  //   if (data) { // Guard condition
  //     let t = []
  //     let r = data.map(d => 
  //       // console.log('useEffect', format(d.createdAt.toDate(), "yyyy-MM-dd"))
  //       //categoriesList.push({d}.category.name)
  //       t.push(d.category)

  //     )
  //   }
  // },
  //   [data])


  //   useEffect(() => {
  //   if (data) { // Guard condition
  //     let t = []
  //     let r = data.map((d, i) => {
  //       // console.log('useEffect', format(d.createdAt.toDate(), "yyyy-MM-dd"))
  //       //check if the category is already rendered or not
  //       const alreadyRender = t.find((x) => x == d.category.name || d.category.name == 'Uncategorize')
  //       if(alreadyRender){
  //         //do nothing
  //       }else{
  //         t.push(d.category.name)
  //         return (
  //           <CategoryRow
  //             data={d}
  //             onDeleteClick={handleDeleteClick}
  //             //onEditClick={handleEditClick}
  //           />
  //         )

  //       }


  //     })
  //     setRecords(r)

  //   }
  // },
  //   [data])

  useEffect(() => {
    if (cate) { // Guard condition
      let t = []
      let r = cate.map((d, i) => {
        // console.log('useEffect', format(d.createdAt.toDate(), "yyyy-MM-dd"))
        //check if the category is already rendered or not
        if (d.catId !== 0) {
          return (
            <CategoryRow
              data={d}
              onDeleteClick={handleDeleteClick}
              onEditClick={handleEditClick}
            />
          )
        }

      })
      setRecords(r)

    }
  },
    [cate])

    const handleshowForm = () => setShowForm(true)

    const onSubmit = async (data) => {
      let preparedData = {
        // ...data,
        catId: parseFloat(data.catId),
        name: data.name,
      }
      console.log('onSubmit', preparedData)
  
      //add 2.5
      if (editMode) {
        // Update record
        console.log("UPDATING!!!!", data.id)
        await categoryRef.doc(data.id)
          .set(preparedData)
          .then(() => console.log("Category has been updated"))
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
        await cate
          categoryRef.add(preparedData)
          .then(() => console.log("New record has been added."))
          .catch((error) => {
            console.error("Errror:", error)
            alert(error)
          })
        // setShowForm(false)
      }
      handleCloseForm()
    }


  const handleDeleteClick = (id) => {
    console.log('handleDeleteClick in Category', id)
    if (window.confirm("Are you sure to delete this Category?")) {
      categoryRef.doc(id).delete();
      console.log("the category was deleted")
    }

    // if (window.confirm("Are you sure to delete this Category?"))
    //   moneyRef.doc(id).delete()
  }

  const handleEditClick = (data) => {
    let preparedData = {
      id: data.id,
      catId: data.catId,
      name: data.name,
      
      // id: data.id,
      // description: data.description,
      // amount: parseFloat(data.amount),
      // createdAt: data.createdAt.toDate(),
      // category: category
    }
    console.log("handleEditClick", preparedData)
    // expect original data type for data.createdAt is Firebase's timestamp
    // convert to JS Date object and put it to the same field
    // if ('toDate' in data.createdAt) // guard, check wther toDate() is available in createdAt object.
    //   data.createdAt = data.createdAt.toDate()

    setTempData(preparedData)
    setShowForm(true)
    setEditMode(true)
  }


  // console.log(categoryList)

  return (
    <Container>
      <Row>
        <Col>
          <h1>Category Management</h1>
          {/* add 1 */}
          <Button variant="outline-dark" onClick={handleshowForm}>
            <BsPlus /> Add
      </Button>
        </Col>
      </Row>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>#</th>
            <th>Category ID</th>
            <th>Category Name</th>
          </tr>
        </thead>
        <tbody>
          {records}
        </tbody>
      </Table>

      <Modal show={showForm} onHide={handleCloseForm}>
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
            {editMode ? "Edit Record" : "Add New Record"}
          </Modal.Header>
          <Modal.Body>
          <Row>
              <Col>
                <label htmlFor="catId">Category ID</label>
              </Col>
              <Col>
                <input
                  type="number"
                  placeholder="catId"
                  ref={register({ required: true })}
                  name="catId"
                  id="catId"
                  defaultValue={tempData.catId}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <label htmlFor="name">Name</label>
              </Col>
              <Col>
                <input
                  type="text"
                  placeholder="name"
                  ref={register({ required: true })}
                  name="name"
                  id="name"
                  defaultValue={tempData.name}
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseForm}>
              Close
                        </Button>
            <Button variant={editMode ? "success" : "primary"} type="submit">
              {editMode ? "Save Category" : "Add Category"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </Container>



  )


  function CategoryRow(props) {
    let d = props.data
    // console.log("JournalRow", d)
    return (
      <tr>
        <td>
          <BsTrash onClick={() => props.onDeleteClick(d.id)} />
          <BsPencil onClick={() => props.onEditClick(d)} />
        </td>
        <td>{d.catId}</td>
        <td>{d.name}</td>
      </tr>
    )
  }
}