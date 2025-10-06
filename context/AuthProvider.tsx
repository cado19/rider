import { useRouter } from "expo-router";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { supabase } from "../util/supabase";
import { Session } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthProviderProps = {
  children: ReactNode;
};

type AuthContextType = {
  session: Session | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [session, setSession] = useState<Session | null>(null);
    const router = useRouter();
    const init = async () => {
        const {data: { session }} = await supabase.auth.getSession();
        setSession(session);
    }
    useEffect(() => {
        init();

        const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if(event === "SIGNED_IN" && session?.user){
                const userId = session.user.id;

                //check if profile already exists
                const { data: rider } = await supabase.from('riders').select('id').eq('id', userId).single();

                if(!rider){
                    const cached = await AsyncStorage.getItem('pending_profile');
                    if(cached){
                        const { first_name, last_name } = JSON.parse(cached);

                        await supabase.from('riders').insert({
                            id: userId,
                            first_name,
                            last_name
                        });

                        await AsyncStorage.removeItem('pending_profile');
                    }
                }
            }
            setSession(session);

            if (session) {
                router.replace('/(tabs)/home'); // redirect to in-app flow
            } else {
                router.replace('/(auth)/signin'); // redirect to auth flow
            }
        });
        
        return () => {
            listener?.subscription?.unsubscribe();
        };
    },[])
  return (
    <AuthContext.Provider value={{ session }}>
      { children }
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext);
