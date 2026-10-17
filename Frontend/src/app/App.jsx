import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RouterProvider } from 'react-router'
import {router} from "./app.routes"
import { useAuth } from '../features/auth/hooks/auth.hook'
const App = () => {
    const {handleGetMe}=useAuth();
    const user=useSelector(state=>state.auth.user)
    console.log(user);
    useEffect(()=>{
      handleGetMe();
    },[])
    return (
        <>
        <RouterProvider router={router}/>

        </>
    )
}

export default App