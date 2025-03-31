-- Create patients table
CREATE TABLE the_patients_of_my_system (
    id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL
);

-- Create billing table
CREATE TABLE billing_for_the_patients (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES the_patients_of_my_system(id),
    provider TEXT NOT NULL,
    purpose TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create lab_results table
CREATE TABLE results_of_the_laboratory_tests (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES the_patients_of_my_system(id),
    condition TEXT NOT NULL,
    date DATE NOT NULL,
    diagnosis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create prescriptions table
CREATE TABLE list_of_prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES the_patients_of_my_system(id),
    drug TEXT NOT NULL,
    dosage TEXT NOT NULL,
    date_issued DATE NOT NULL,
    expiry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert some sample data
INSERT INTO patients (first_name, last_name, date_of_birth) VALUES
    ('George', 'Washington', '1985-02-22'),
    ('John', 'Adams', '1990-10-30'),
    ('Benjamin', 'Franklin', '1975-01-17'),
    ('John', 'Smith', '1995-06-15');

INSERT INTO billing (patient_id, provider, purpose, amount, paid) VALUES
    -- George Washington's bills
    (1, 'Dr. Wilson', 'Annual Physical', 200.00, true),
    (1, 'Mount Vernon Medical', 'Dental Surgery', 1500.00, false),
    (1, 'Colonial Imaging', 'MRI Scan', 800.00, true),
    (1, 'Valley Forge Lab', 'Blood Work', 150.00, true),
    
    -- John Adams's bills
    (2, 'Dr. Brown', 'Consultation', 175.00, true),
    (2, 'Quincy Medical Center', 'Emergency Visit', 950.00, false),
    (2, 'Adams Family Practice', 'Vaccination', 85.00, true),
    
    -- Benjamin Franklin's bills
    (3, 'Dr. Lightning', 'Cardiac Checkup', 300.00, true),
    (3, 'Philadelphia General', 'Physical Therapy', 600.00, false),
    (3, 'Penn Medical Group', 'Eye Exam', 125.00, true),
    (3, 'Liberty Medical', 'Specialist Consultation', 250.00, false),
    
    -- John Smith's bills
    (4, 'Dr. Anderson', 'Annual Checkup', 150.00, true),
    (4, 'City Hospital', 'X-Ray', 275.00, false),
    (4, 'Smith Family Practice', 'Flu Shot', 45.00, true);

INSERT INTO lab_results (patient_id, condition, date, diagnosis) VALUES
    -- George Washington's lab results
    (1, 'Dental Examination', '2024-01-15', 'Requires wisdom tooth extraction'),
    (1, 'Blood Panel', '2024-02-01', 'Normal cholesterol levels'),
    (1, 'MRI Results', '2024-02-15', 'Minor shoulder inflammation'),
    
    -- John Adams's lab results
    (2, 'Allergy Panel', '2024-01-20', 'Allergic to penicillin'),
    (2, 'COVID Test', '2024-02-10', 'Negative'),
    (2, 'Strep Culture', '2024-02-12', 'Positive - requires antibiotics'),
    (2, 'Blood Sugar Test', '2024-02-14', 'Slightly elevated'),
    
    -- Benjamin Franklin's lab results
    (3, 'Cardiac Stress Test', '2024-01-10', 'Normal heart function'),
    (3, 'Vision Test', '2024-01-25', 'Requires bifocals'),
    (3, 'Blood Pressure Series', '2024-02-05', 'Hypertension - Stage 1'),
    
    -- John Smith's lab results
    (4, 'Chest X-Ray', '2024-02-01', 'Clear lungs'),
    (4, 'Blood Panel', '2024-02-10', 'Low vitamin D'),
    (4, 'Respiratory Function', '2024-02-15', 'Mild asthma');

INSERT INTO prescriptions (patient_id, drug, dosage, date_issued, expiry_date) VALUES
    -- George Washington's prescriptions
    (1, 'Amoxicillin', '500mg twice daily', '2024-02-15', '2024-02-22'),
    (1, 'Ibuprofen', '800mg as needed', '2024-02-15', '2024-08-15'),
    (1, 'Flexeril', '10mg daily', '2024-02-15', '2024-03-15'),
    
    -- John Adams's prescriptions
    (2, 'Azithromycin', '250mg daily', '2024-02-12', '2024-02-19'),
    (2, 'Metformin', '500mg twice daily', '2024-02-14', '2024-08-14'),
    (2, 'Claritin', '10mg daily', '2024-01-20', '2025-01-20'),
    (2, 'Ventolin', 'Two puffs as needed', '2024-01-15', '2025-01-15'),
    
    -- Benjamin Franklin's prescriptions
    (3, 'Lisinopril', '10mg daily', '2024-02-05', '2024-08-05'),
    (3, 'Lipitor', '20mg daily', '2024-01-10', '2024-07-10'),
    (3, 'Aspirin', '81mg daily', '2024-01-10', '2025-01-10'),
    
    -- John Smith's prescriptions
    (4, 'Vitamin D3', '2000IU daily', '2024-02-10', '2025-02-10'),
    (4, 'Albuterol', 'Two puffs as needed', '2024-02-15', '2025-02-15'),
    (4, 'Flonase', 'One spray each nostril daily', '2024-02-01', '2024-08-01');
