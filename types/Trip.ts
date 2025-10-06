export interface Trip {
  id: string;
  rider_id: string;
  driver_id: string;
  origin: any; // or use PostGIS types if you’ve defined them
  destination: any;
  fare: number;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string | null;
}
