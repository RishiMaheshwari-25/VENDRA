import { register,login,getMe } from "../services/auth.service";
import { setUser, setError, setLoading } from "../state/auth.slice";
import { useDispatch, useSelector } from "react-redux";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);

    async function handleRegister({ email, password, contact, fullname, isSeller = false }) {
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await register({ email, password, contact, fullname, isSeller });
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Registration failed";
            dispatch(setError(message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }
    async function handleLogin({email,password}){
        try {
            dispatch(setLoading(true));
            dispatch(setError(null));
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data.user;
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || "Login failed";
            dispatch(setError(message));
            throw err;
        } finally {
            dispatch(setLoading(false));
        }
    }
    async function handleGetMe(){
        try{
            dispatch(setLoading(true));
        const data=await getMe();
        dispatch(setUser(data.user))
        }catch(err){
            console.log(err);

        }
        finally{
        dispatch(setLoading(false));}
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        user,
        loading,
        error
    };

};
