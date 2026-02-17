import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import firebaseconfig from './config.json';
import { useAuthState, useSignInWithFacebook, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { useState, useEffect } from 'react';

firebase.initializeApp(firebaseconfig)

const auth = firebase.auth();
const firestore = firebase.firestore();
const messagesRef = firestore.collection('messages');


function App() {
  const query = messagesRef.orderBy('createdAt');
  const [messages] = useCollectionData(query, {idField: 'id'});


  const [user]  = useAuthState(auth);

  return (
    <>
      {user ? <><ChatRoom messages={messages}/></> : <SignIn/>}
    </>
  );
}

function SignIn() {
  const useSignInWithFacebook = () => {
    const provider = new firebase.auth.FacebookAuthProvider();
    console.log(provider)
    auth.signInWithPopup(provider);
  }
  const useSignInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    console.log(provider)
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button onClick={useSignInWithFacebook}>Sign in with Facebook</button>
      <button onClick={useSignInWithGoogle}>Sign in with Google</button>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign out</button>
  )
}



function ChatRoom({messages}) {
  const [message, setMessage] = useState();
  const submitMessage = async(e) => {
    e.preventDefault();
  
    const { uid, photoURL } = auth.currentUser;
  
    await messagesRef.add({
      text: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setMessage('');
  }

  return(
    <section className="chatbox">
      <SignOut/>
      <section className="chat-window">
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
      </section>
      <form className="chat-input" onSubmit={submitMessage}>
        <input type="text" autoComplete="on" placeholder="Type a message" onChange={(e) => {setMessage(e.target.value)}} />
        <button type='submit'>
          send
        </button>
      </form>
    </section>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'msg-self' : 'msg-remote';
  console.log(messageClass)
  return (
    <article className={`msg-container ${messageClass}`} id={`msg-${uid}`}>
      <div className="msg-box">
        <img className="user-img" id={`user-${uid}`} src={photoURL ?? "//gravatar.com/avatar/00034587632094500000000000000000?d=retro"} />
        <div className="flr">
          <div className="messages">
            <p className="msg" id={`msg-${uid}`}>{text}</p>
          </div>
          <span className="timestamp">
            <span className="username">Name</span>
          </span>
        </div>
      </div>
    </article>
 
  )
}

export default App;
