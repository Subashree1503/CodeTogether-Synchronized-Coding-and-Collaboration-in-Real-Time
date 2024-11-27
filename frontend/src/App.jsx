import React from 'react'
import EnterName from '../../src/EnterName'
import RealTimeEditor from '../../src/RealTimeEditor'
import './App.css'
import { useStore } from '../../src/store'

const App = () => {
  const username = useStore(({ username }) => username)

  return <>{username ? <RealTimeEditor /> : <EnterName />}</>
}

export default App
