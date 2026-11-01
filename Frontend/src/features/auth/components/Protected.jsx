import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router';

const Protected = ({children,role="buyer"}) => {
    const user=useSelector(state=>state.auth.user);
    const loading=useSelector(state=>state.auth.loading);
    const location=useLocation();
    if(loading){
        return <div className="page-loading" role="status"><span className="spinner" /></div>
    }
    if(!user){
        return <Navigate to="/login" state={{from:location.pathname+location.search}} replace />;
    }
    if(user.role!=role){
        return <Navigate to ="/" replace />
    }
  return children

}

export default Protected
