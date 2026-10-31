/**
 * Built-in sample datasets as raw CSV strings. Kept small but representative
 * so each demonstrates different analysis features.
 */

export interface SampleDataset {
  id: 'grades' | 'sales' | 'messy';
  name: string;
  description: string;
  fileName: string;
  csv: string;
}

const grades = `student_id,name,grade,score,subject,passed,enrolled_date
1001,Ava Chen,A,92,Mathematics,yes,2024-01-15
1002,Liam Patel,B,84,Mathematics,yes,2024-01-15
1003,Noah Kim,C,71,Science,yes,2024-01-16
1004,Emma Wong,A,95,Science,yes,2024-01-16
1005,Olivia Tan,F,48,Mathematics,no,2024-01-17
1006,William Lee,B,88,History,yes,2024-01-18
1007,Sophia Raj,A,91,Science,yes,2024-01-18
1008,James Lim,D,61,History,yes,2024-01-19
1009,Mia Gupta,B,83,Mathematics,yes,2024-01-20
1010,Lucas Ong,C,74,Science,yes,2024-01-20
1011,Isabella Ho,A,98,History,yes,2024-01-21
1012,Ethan Koh,F,39,Mathematics,no,2024-01-22
1013,Charlotte Ng,B,86,Science,yes,2024-01-23
1014,Mason Teo,C,70,History,yes,2024-01-24
1015,Amelia Goh,A,93,Mathematics,yes,2024-01-25
1016,Logan Sim,D,58,Science,no,2024-01-26
1017,Harper Low,B,81,History,yes,2024-01-27
1018,Elijah Yeo,A,96,Mathematics,yes,2024-01-28
1019,Evelyn Chua,C,73,Science,yes,2024-01-29
1020,Aiden Foo,B,85,History,yes,2024-01-30`;

const sales = `order_id,order_date,product,category,quantity,unit_price,revenue,region
5001,2024-01-05,Wireless Mouse,Electronics,3,"$24.99",74.97,North
5002,2024-01-12,Desk Lamp,Home,1,"$39.50",39.50,South
5003,2024-01-19,Notebook,Stationery,10,"$3.20",32.00,East
5004,2024-02-02,Wireless Mouse,Electronics,5,"$24.99",124.95,West
5005,2024-02-14,Standing Desk,Furniture,1,"$299.00",299.00,North
5006,2024-02-21,Desk Lamp,Home,2,"$39.50",79.00,South
5007,2024-03-03,Monitor,Electronics,2,"$189.00",378.00,East
5008,2024-03-15,Notebook,Stationery,25,"$3.20",80.00,West
5009,2024-03-28,Office Chair,Furniture,1,"$149.00",149.00,North
5010,2024-04-05,Monitor,Electronics,3,"$189.00",567.00,South
5011,2024-04-18,Wireless Mouse,Electronics,8,"$24.99",199.92,East
5012,2024-04-30,Standing Desk,Furniture,2,"$299.00",598.00,West
5013,2024-05-09,Desk Lamp,Home,4,"$39.50",158.00,North
5014,2024-05-22,Office Chair,Furniture,3,"$149.00",447.00,South
5015,2024-06-01,Monitor,Electronics,4,"$189.00",756.00,East
5016,2024-06-14,Notebook,Stationery,40,"$3.20",128.00,West
5017,2024-06-27,Standing Desk,Furniture,3,"$299.00",897.00,North
5018,2024-07-08,Wireless Mouse,Electronics,12,"$24.99",299.88,South
5019,2024-07-19,Office Chair,Furniture,5,"$149.00",745.00,East
5020,2024-07-30,Monitor,Electronics,6,"$189.00",1134.00,West`;

const messy = `id,customer,city,age,income,status,signup,notes
1,John Smith,Kuala Lumpur,34,55000,Active,2023-03-01,
2,jane doe,Kuala Lumpur,28,48000,active,2023-03-05,good customer
3,Bob Lee,Penang,,62000,Active,03/08/2023,
4,Alice Tan,Kuala Lumpur,45,,ACTIVE,2023-03-12,vip
5,Charlie Ng,Kuala Lumpur,31,51000,Inactive,2023-03-15,
6,John Smith,Kuala Lumpur,34,55000,Active,2023-03-01,
7,Diana Wong,Johor,52,88000,active,2023-03-20,
8,,Kuala Lumpur,29,,Active,2023-03-22,missing name
9,Frank Lim,Kuala Lumpur,38,59000,Inactive,2023-03-25,
10,Grace Koh,Kuala Lumpur,41,67000,Active,04/01/2023,
11,Henry Foo,Penang,999,72000,active,2023-04-05,age looks wrong
12,Ivy Chua,Kuala Lumpur,33,,ACTIVE,2023-04-10,
13,Jack Ho,Kuala Lumpur,47,81000,Inactive,2023-04-15,
14,John Smith,Kuala Lumpur,34,55000,Active,2023-03-01,
15,Karen Sim,Johor,36,,active,2023-04-20,
16,Leo Teo,Kuala Lumpur,,49000,Active,2023-04-22,
17,Mona Goh,Kuala Lumpur,55,95000,Inactive,2023-04-25,
18,Nina Low,Kuala Lumpur,27,45000,active,2023-04-28,
19,Oscar Yeo,Penang,43,,ACTIVE,2023-05-01,
20,Paul Ong,Kuala Lumpur,39,63000,Active,2023-05-05,`;

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'grades',
    name: 'Student grades',
    description: 'Clean classroom dataset with scores, subjects, and pass/fail flags.',
    fileName: 'student-grades.csv',
    csv: grades,
  },
  {
    id: 'sales',
    name: 'E-commerce sales',
    description: 'Orders over time with currency-formatted prices and a date column.',
    fileName: 'ecommerce-sales.csv',
    csv: sales,
  },
  {
    id: 'messy',
    name: 'Messy customers',
    description: 'Missing values, duplicate rows, an outlier, and inconsistent casing.',
    fileName: 'messy-customers.csv',
    csv: messy,
  },
];

export function getSample(id: SampleDataset['id']): SampleDataset {
  const found = SAMPLE_DATASETS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown sample: ${id}`);
  return found;
}
