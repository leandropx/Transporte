-- Supabase Database Schema for Fleet Management System
-- Enable row-level security and indexing for high performance capabilities

-- We enable the pgcrypto extension to generate UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-------------------------------------------------------
-- 1. TABLES
-------------------------------------------------------

-- VEHICLES --
CREATE TABLE public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    brand TEXT,
    model TEXT NOT NULL,
    year_model INTEGER,
    mileage INTEGER,
    capacity NUMERIC, -- Using numeric to allow decimals if needed (e.g., tons, kg)
    status TEXT NOT NULL CHECK (status IN ('disponible', 'en ruta', 'en taller', 'inactivo')) DEFAULT 'disponible',
    documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for global search on license plates
CREATE INDEX idx_vehicles_license_plate ON public.vehicles(license_plate);

-- ROUTES --
CREATE TABLE public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    driver_id UUID, -- If you have an auth.users or drivers table, this would be the FK
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('planeada', 'en curso', 'completada', 'cancelada')) DEFAULT 'planeada',
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for searching routes by vehicle
CREATE INDEX idx_routes_vehicle_id ON public.routes(vehicle_id);

-- MAINTENANCE LOGS --
CREATE TABLE public.maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('preventivo', 'correctivo')),
    description TEXT,
    replaced_parts TEXT[], -- Array of strings for parts
    cost NUMERIC(10, 2) DEFAULT 0.00,
    maintenance_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Index for searching maintenance per vehicle
CREATE INDEX idx_maintenance_vehicle_id ON public.maintenance_logs(vehicle_id);

-------------------------------------------------------
-- 2. SQL TRIGGERS & FUNCTIONS
-------------------------------------------------------

-- Function to set a vehicle's status to "en taller"
CREATE OR REPLACE FUNCTION update_vehicle_status_on_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the vehicle status when a maintenance log is added
    UPDATE public.vehicles
    SET status = 'en taller'
    WHERE id = NEW.vehicle_id AND status != 'en taller';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger firing AFTER INSERT on maintenance logs
CREATE TRIGGER trigger_update_status_on_maintenance
AFTER INSERT ON public.maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION update_vehicle_status_on_maintenance();


-------------------------------------------------------
-- 3. ROW-LEVEL SECURITY (RLS)
-------------------------------------------------------

-- Enable RLS for all tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (ONLY accessible for Authenticated users)
-- In a real app we might want to check the user's role, but this ensures safe base functionality

-- VEHICLES
CREATE POLICY "Vehicles are viewable by authenticated users"
ON public.vehicles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Vehicles can be inserted by authenticated users"
ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Vehicles can be updated by authenticated users"
ON public.vehicles FOR UPDATE TO authenticated USING (true);

-- ROUTES
CREATE POLICY "Routes are viewable by authenticated users"
ON public.routes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Routes can be inserted by authenticated users"
ON public.routes FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Routes can be updated by authenticated users"
ON public.routes FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Routes can be deleted by authenticated users"
ON public.routes FOR DELETE TO authenticated USING (true);

-- MAINTENANCE LOGS
CREATE POLICY "Maintenance logs viewable by authenticated users"
ON public.maintenance_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Maintenance logs inserted by authenticated users"
ON public.maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Maintenance logs updated by authenticated users"
ON public.maintenance_logs FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Maintenance logs deleted by authenticated users"
ON public.maintenance_logs FOR DELETE TO authenticated USING (true);

-------------------------------------------------------
-- 4. STORAGE
-------------------------------------------------------

-- Create Storage bucket "fleet_assets" for documents and pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fleet_assets', 'fleet_assets', true)
ON CONFLICT (id) DO NOTHING;
