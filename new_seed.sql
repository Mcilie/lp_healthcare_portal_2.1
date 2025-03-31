-- Create patients table
CREATE TABLE system_patients (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL
);

-- Create billing table
CREATE TABLE patient_billing (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES system_patients(id),
    provider TEXT NOT NULL,
    purpose TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create lab_results table
CREATE TABLE patient_lab_results (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES system_patients(id),
    condition TEXT NOT NULL,
    date DATE NOT NULL,
    diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create prescriptions table
CREATE TABLE patient_rx (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES system_patients(id),
    drug TEXT NOT NULL,
    dosage TEXT NOT NULL,
    date_issued DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);


-- Insert the patients
INSERT INTO system_patients (id, first_name, last_name, date_of_birth) VALUES
    (1, 'John', 'Kennedy', '1978-06-22'),
    (2, 'Franklin', 'Roosevelt', '1983-03-14'),
    (3, 'Ronald', 'Reagan', '1972-09-27'),
    (4, 'SpongeBob', 'SquarePants', '1997-05-01'),
    (5, 'Jane', 'Doe', '1992-03-15');

-- Insert billing records
INSERT INTO patient_billing (patient_id, provider, purpose, amount, paid, created_at) VALUES
    -- John Kennedy's bills
    (1, 'Boston Medical Center', 'Annual Physical', 175.00, true, '2023-12-15'::timestamptz),
    (1, 'Massachusetts General Hospital', 'Back Surgery', 2500.00, false, '2024-01-20'::timestamptz),
    (1, 'Camelot Pharmacy', 'Prescription Refill', 45.00, true, '2024-02-01'::timestamptz),

    -- Franklin Roosevelt's bills
    (2, 'New York Presbyterian', 'Emergency Room Visit', 950.00, true, '2023-11-10'::timestamptz),
    (2, 'Hyde Park Medical Group', 'Respiratory Consultation', 300.00, false, '2024-01-15'::timestamptz),
    (2, 'New Deal Health Services', 'Vaccination', 75.00, true, '2024-02-05'::timestamptz),

    -- Ronald Reagan's bills
    (3, 'California Medical Center', 'Vision Screening', 225.00, true, '2023-12-01'::timestamptz),
    (3, 'West Coast Specialists', 'Hearing Test', 350.00, true, '2024-01-10'::timestamptz),
    (3, 'Presidential Health', 'Physical Therapy', 150.00, false, '2024-02-10'::timestamptz),

    -- SpongeBob's bills
    (4, 'Bikini Bottom Medical', 'Hydration Assessment', 200.00, true, '2023-12-20'::timestamptz),
    (4, 'Undersea General', 'Jellyfish Sting Treatment', 275.00, true, '2024-01-05'::timestamptz),
    (4, 'Krusty Krab Clinic', 'Annual Checkup', 150.00, false, '2024-02-15'::timestamptz),

    -- Jane Doe's bills
    (5, 'City Medical Center', 'Women''s Health Checkup', 225.00, true, '2023-12-10'::timestamptz),
    (5, 'Metropolitan Hospital', 'MRI Scan', 850.00, false, '2024-01-25'::timestamptz),
    (5, 'Downtown Clinic', 'Nutritional Consultation', 125.00, true, '2024-02-08'::timestamptz);

-- Insert lab results
INSERT INTO patient_lab_results (patient_id, condition, date, diagnosis, created_at) VALUES
    -- John Kennedy's lab results
    (1, 'Spinal MRI', '2024-01-20', 'Herniated disc requiring surgical intervention', '2024-01-20'::timestamptz),
    (1, 'Blood Panel', '2023-12-15', 'Moderately elevated triglycerides', '2023-12-15'::timestamptz),
    (1, 'Back Assessment', '2024-02-01', 'Chronic lower back pain with mild nerve impingement', '2024-02-01'::timestamptz),

    -- Franklin Roosevelt's lab results
    (2, 'Pulmonary Function Test', '2024-01-15', 'Mild asthmatic symptoms with good response to bronchodilators', '2024-01-15'::timestamptz),
    (2, 'Chest X-Ray', '2023-11-10', 'Minor bronchial inflammation, no pneumonia', '2023-11-10'::timestamptz),
    (2, 'Allergy Panel', '2024-02-05', 'Allergic reactions to dust and seasonal pollen', '2024-02-05'::timestamptz),

    -- Ronald Reagan's lab results
    (3, 'Eye Examination', '2023-12-01', 'Moderate presbyopia requiring bifocals', '2023-12-01'::timestamptz),
    (3, 'Audiometry', '2024-01-10', 'Mild to moderate hearing loss in higher frequencies', '2024-01-10'::timestamptz),
    (3, 'Balance Test', '2024-02-10', 'Slight vestibular dysfunction affecting gait', '2024-02-10'::timestamptz),

    -- SpongeBob's lab results
    (4, 'Water Content Analysis', '2023-12-20', 'Optimal hydration levels', '2023-12-20'::timestamptz),
    (4, 'Skin Culture', '2024-01-05', 'Minor inflammation from jellyfish toxin, healing well', '2024-01-05'::timestamptz),
    (4, 'Routine Seawater Screening', '2024-02-15', 'All values within normal range for marine organisms', '2024-02-15'::timestamptz),

    -- Jane Doe's lab results
    (5, 'Mammogram', '2023-12-10', 'No abnormalities detected', '2023-12-10'::timestamptz),
    (5, 'Brain MRI', '2024-01-25', 'No acute intracranial abnormality', '2024-01-25'::timestamptz),
    (5, 'Vitamin Panel', '2024-02-08', 'Vitamin D deficiency noted', '2024-02-08'::timestamptz);

-- Insert prescriptions
INSERT INTO patient_rx (patient_id, drug, dosage, date_issued, expiry_date, created_at) VALUES
    -- John Kennedy's prescriptions
    (1, 'Gabapentin', '300mg twice daily', '2024-01-20', '2024-07-20', '2024-01-20'::timestamptz),
    (1, 'Crestor', '10mg daily', '2023-12-15', '2024-06-15', '2023-12-15'::timestamptz),
    (1, 'Flexeril', '10mg as needed', '2024-02-01', '2024-03-01', '2024-02-01'::timestamptz),

    -- Franklin Roosevelt's prescriptions
    (2, 'Albuterol', 'Two puffs as needed', '2024-01-15', '2024-07-15', '2024-01-15'::timestamptz),
    (2, 'Prednisone', '5mg daily', '2023-11-10', '2024-01-10', '2023-11-10'::timestamptz),
    (2, 'Flonase', 'One spray per nostril daily', '2024-02-05', '2024-08-05', '2024-02-05'::timestamptz),

    -- Ronald Reagan's prescriptions
    (3, 'Aricept', '5mg daily', '2023-12-01', '2024-06-01', '2023-12-01'::timestamptz),
    (3, 'Meclizine', '25mg as needed for dizziness', '2024-01-10', '2025-01-10', '2024-01-10'::timestamptz),
    (3, 'Latanoprost', 'One drop in each eye at bedtime', '2024-02-10', '2024-08-10', '2024-02-10'::timestamptz),

    -- SpongeBob's prescriptions
    (4, 'Marine Antioxidant', 'One tablet daily', '2023-12-20', '2024-06-20', '2023-12-20'::timestamptz),
    (4, 'Jellyfish Sting Relief Gel', 'Apply to affected areas 3x daily', '2024-01-05', '2024-07-05', '2024-01-05'::timestamptz),
    (4, 'Sea Minerals Complex', 'Two tablets with meals', '2024-02-15', '2025-02-15', '2024-02-15'::timestamptz),

    -- Jane Doe's prescriptions
    (5, 'Vitamin D3', '5000IU daily', '2024-02-08', '2025-02-08', '2024-02-08'::timestamptz),
    (5, 'Iron Supplement', '65mg daily', '2023-12-10', '2024-06-10', '2023-12-10'::timestamptz),
    (5, 'Calcium + D', '1200mg daily', '2024-01-25', '2024-07-25', '2024-01-25'::timestamptz);