import { router } from "expo-router";
import { supabase } from "../util/supabase";

export const restoreActiveTrip = async (userId: string) => {
  // query active trip
  const { data: activeTrip } = await supabase
    .from("trips_with_geojson")
    .select("*")
    .in("status", ["accepted", "arrived", "in_progress"])
    .maybeSingle();

    if(activeTrip){
        router.replace({
            pathname: "(root)/driver_details",
            params: { tripId: activeTrip.id }
        });
    }
};
