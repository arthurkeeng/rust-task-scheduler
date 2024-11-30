
import React , {useEffect , useState } from 'react'
import {MdDelete , MdEdit, MdConfirmationNumber} from "react-icons/md"
import axios from 'axios'
import { format } from 'date-fns'

const index = () => {
  const [editText , setEditText] = useState()
  const [todos , setTodos] = useState([])
  const [todosCopy , setTodosCopy] = useState(todos)
  const [todoInput , setTodoInput] = useState("")
  const [index , setIndex] = useState(-1)
  const [searchInput , setSearchInput] = useState("")
  const [searchResult , setSearchResult] = useState([])
  // state management

  const [count , setCount]= useState(0)
  const [search , setSearch] =useState("")
  const [searchItem , setSearchItem] =useState(search)

  useEffect(()=>{
    fetchTodos()
  },[count])

  useEffect(()=>{
    if(search){onHandleSearch()}
    else{onClearSearch()}
  }, [search])

  // useEffect(()=>{
  //   const timer = setTimeout(()=> setSearch(searchItem) , 1000);
  //   return ()=> clearTimeout(timer)
  // }, [searchItem])

  const editItem = async(index) =>{
    setIndex(index)
    const updatedTodo = todos[index];
    setTodoInput(updatedTodo.title)
    // updatedTodo.title = todoInput
    console.log(updatedTodo);
    
  }

  const fetchTodos = async()=> {
    try {
      const {data} = await axios.get("http://127.0.0.1:5000/todos")
      console.log(data)
      setTodos(data)
      setTodosCopy(data)
    } catch (error) {
      console.log("couldn't fetch todos")
    }
  }
  const createTodos = async()=> {
    try {
      if(index !== -1){
        const todoUpdate  = {...todos[index] , title : todoInput}
        
        const {data} = await axios.patch(`http://127.0.0.1:5000/todos/${todoUpdate.id}`,{
          title : todoInput 
        })
      const updatedTodos = [...todos]
      updatedTodos[index] = todoUpdate;
      setTodos(updatedTodos);
      setIndex(-1)
      setCount(count + 1)
      setTodoInput("")
    
      }
      
      else{
        console.log('the todo input ' , todoInput)
        const {data} = await axios.post("http://127.0.0.1:5000/todos", {
        title : todoInput , 
        completed : false
      })
      console.log(data)
      setTodos(data)
      setTodosCopy(data)}
    } catch (error) {
      console.log("couldn't fetch todos")
    }
  }

  const deleteTodo  = async(id) =>{
    try {
      const {data} = await axios.delete(`http://127.0.0.1:5000/todos/${id}`)
      setTodos(todos.filter(todo => todo.id != id))
    } catch (error) {
      
    }
  }
  const toggleCompleted  = async(index) =>{
    try {
      const todoToUpdate = {
        ...todos[index] , completed : !todos[index].completed
      }
      const {data} = await axios.patch(`http://127.0.0.1:5000/todos/${todoToUpdate.id}`)
      const updatedTodos = [...todos]
      updatedTodos[index] = data;
      setCount(count+ 1)

    } catch (error) {
      
    }
  }

  const onClearSearch = () =>{
    if(todos.length && todosCopy.length){
      setTodos(todosCopy)
    }
  }
  const onHandleSearch = value => {
    console.log("the value is " , value);
    
    const filteredTodo = todos.filter(({title}) => title.toLowerCase().includes(value.toLowerCase()))
    if(filteredTodo.length === 0 ){
      setTodos(todosCopy)
    }
    else{
      setTodos(filteredTodo)
    }
  }
  const searchTodo = () => {
    const results = todos.filter(todo => todo.title.toLowerCase().includes(searchInput.toLocaleLowerCase()))
    setSearchResult(results)

  }

  const formatData = (dateString) => {
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime())? "Invalid Date" : format(date , "yyyy-MM-dd-hh:mm")
    } catch (error) {
      
    }
  }

  const renderTodos = (todoToRender) =>{
    return todoToRender.map((todo , index) =>(
      <li key={index} className='li'>
        <label htmlFor='' className='form-check-label'></label>
        <span className='todo-text'>
          {`${todo.title}  ${formatData(todo.created_at)}`} </span>
        <span className='span-button'
        onClick={() => deleteTodo(todo.id)}>
          <i className='fa-solid fa-trash'>
            <MdDelete/>
            </i></span>
        <span className='span-button'
        onClick={() => editItem(index)}>
          <i className='fa-solid fa-trash'>
            <MdEdit/>
            </i></span>
      </li>
    ))
  }
  return (
    <div className='main-body'>
      <div className='todo-app'>
        <div className='input-section'>
          <input type='text' id='todoInput' placeholder='add items'
          value={todoInput}
          onChange={e=>setTodoInput(e.target.value)}
          />
          <button onClick={()=> createTodos()}
          className='add'
          >{index === -1 ? "Add" : "Update"}</button>
          <input type='text' id='search-input' placeholder='search items'
          value={searchItem}
          onChange={e=>setSearchItem(e.target.value)}
          />
          <button onClick={()=> onHandleSearch(searchItem)}
          >Search</button>
        </div>

        <div className='todos'>
          <ul className='todo-list'>
            {
              renderTodos(todos)
            }
            </ul>
            {
              todos.length === 0 && (
                <div>
                  <img className='face' src='/theblockchaincoders.jpg'/>
                  <h1 className='not-found'>No Todo Found</h1>
                </div>
              )
            }
        </div>
      </div>

      
    </div>
  )
}

export default index
