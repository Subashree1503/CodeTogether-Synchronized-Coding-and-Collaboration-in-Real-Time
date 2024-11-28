import React from 'react'
import EnterName from './components/EnterName'
import RealTimeEditor from './components/RealTimeEditor'
import './App.css'
import { useStore } from './store'

const App = () => {
  const username = useStore(({ username }) => username)

  return <>{username ? <RealTimeEditor /> : <EnterName />}</>
}

export default App
