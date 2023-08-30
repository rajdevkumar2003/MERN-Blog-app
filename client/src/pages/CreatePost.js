import { useState } from 'react';
//import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Editor from '../Editor'
import {Navigate,useNavigate} from "react-router-dom";


export default function CreatePost(){
  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [content,setContent] = useState('');
  const [files, setFiles] = useState('');
  const [redirect, setRedirect] = useState(false);
  
  const navigate=useNavigate();
  
  async function createNewPost(ev){
    const data=new FormData();
    
    if(title===''||summary===''||content===''||files===''){
        window.location.reload(false);
        alert('Please enter all the informations');
        
        navigate('/');

    }
    data.set('title',title);
    data.set('summary',summary);
    data.set('content',content);
    data.set('file',files[0]);
    ev.preventDefault();
    //console.log(files);
    const response=await fetch('http://localhost:4000/post',{
        method:'POST',
        body: data,
        credentials:'include',
    });
    if (response.ok) {
        setRedirect(true);
      }

  }

  if(redirect)return <Navigate to={"/"}/>
    
  return (
        <form onSubmit={createNewPost}>
            <input type="title"
             placeholder={'Title'}
             value={title}
             onChange={ev => setTitle(ev.target.value)} />
      <input type="summary"
             placeholder={'Summary'}
             value={summary}
             onChange={ev => setSummary(ev.target.value)} />
      <input type="file"
             onChange={ev => setFiles(ev.target.files)} />

       <Editor value={content} onChange={setContent} /> 
            <button style={{marginTop:'50px'}}>Create Post</button>

        </form>
    )
}