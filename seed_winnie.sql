-- Insert the patient first!
INSERT INTO patients (id, first_name, last_name, date_of_birth)
VALUES (5, 'Winnie', 'The Pooh', '1999-12-31');

-- Insert billing records
INSERT INTO billing (patient_id, provider, purpose, amount, paid, created_at)
VALUES 
  (5, 'Dr. Rabbit''s Family Practice', 'Annual Checkup', 150.00, true, '2023-12-15'::timestamptz),
  (5, 'Hundred Acre Wood Pharmacy', 'Prescription Refill', 45.99, true, '2023-11-20'::timestamptz),
  (5, 'Owl''s Diagnostic Center', 'Allergy Testing', 275.50, false, '2024-01-05'::timestamptz),
  (5, 'Kanga''s Urgent Care', 'Bee Sting Treatment', 195.00, true, '2023-09-10'::timestamptz);

-- Insert lab results
INSERT INTO lab_results (patient_id, condition, date, diagnosis, created_at)
VALUES 
  (5, 'Honey Allergy Test', '2024-01-05'::date, 'Patient shows no allergic reaction to honey. Consumption habits may continue.', '2024-01-05'::timestamptz),
  (5, 'Blood Sugar Level', '2023-12-15'::date, 'Elevated glucose levels. Recommend reducing honey intake.', '2023-12-15'::timestamptz),
  (5, 'Bee Sting Analysis', '2023-09-10'::date, 'Mild allergic reaction to bee stings. Prescribed EpiPen as precaution.', '2023-09-10'::timestamptz);

-- Insert prescriptions
INSERT INTO prescriptions (patient_id, drug, dosage, date_issued, expiry_date, created_at)
VALUES 
  (5, 'EpiPen', '0.3mg as needed', '2023-09-10'::date, '2024-09-10'::date, '2023-09-10'::timestamptz),
  (5, 'Claritin', '10mg daily', '2023-12-15'::date, '2024-12-15'::date, '2023-12-15'::timestamptz),
  (5, 'Vitamin B Complex', '1 tablet daily', '2023-12-15'::date, '2024-12-15'::date, '2023-12-15'::timestamptz),
  (5, 'Glucose Management Pills', '500mg twice daily', '2024-01-05'::date, '2025-01-05'::date, '2024-01-05'::timestamptz);