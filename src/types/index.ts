export interface Bill {
  id: number
  provider: string
  purpose: string
  amount: number
  paid: boolean
  created_at: string
  patient_id: number
}

export interface LabResult {
  id: number
  condition: string
  date: string
  diagnosis: string
  patient_id: number
  created_at: string
}

export interface Prescription {
  id: number
  drug: string
  dosage: string
  date_issued: string
  expiry_date: string
  patient_id: number
  created_at: string
} 