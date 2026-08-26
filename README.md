# Qauntbit Interview Assessment

## About

Qauntbit Interview Assessment is a Frappe-based application designed to manage and streamline the complete interview assessment process for job applicants.

The application helps HR teams and interviewers manage:

- Interview Round Types
- Assessment Skills and Criteria
- Rating Scales
- Job Opening Interview Rounds
- Job Applicant Assessments
- Skill-wise Ratings
- Weightage Calculations
- Overall Ratings
- Interview Recommendations
- Next Round Processing
- Hold Applicants
- Not Suitable Applicants
- Interview Assessment Reports

---

# Features

## 1. Interview Round Type

The system allows users to create and manage different interview rounds.

Examples:

- HR Round
- Technical Round
- Managerial Round
- Final Round

Each round can be configured according to the interview process.

---

## 2. Interview Assessment Criteria

Assessment skills and criteria can be configured for each interview round.

### Example: HR Round

- Communication
- Confidence
- Attitude
- Behaviour

### Example: Technical Round

- Technical Knowledge
- Programming Skills
- Problem Solving
- Subject Knowledge

Each assessment criterion can have its own weightage.

---

## 3. Rating Scale

The application allows the configuration of rating scales for evaluating applicants.

Example:

| Rating | Description |
|---|---|
| 1 | Poor |
| 2 | Below Average |
| 3 | Average |
| 4 | Good |
| 5 | Excellent |

---

## 4. Job Opening Configuration

Interview rounds can be configured for a Job Opening.

Example:

| Sequence | Interview Round |
|---|---|
| 1 | HR Round |
| 2 | Technical Round |
| 3 | Managerial Round |
| 4 | Final Round |

The sequence determines the order in which the applicant progresses through the interview process.

---

## 5. Job Applicant

The applicant is linked with the Job Opening and enters the interview assessment process.

The system uses the applicant information to track the interview progress.

---

## 6. Interview Assessment

The Interview Assessment form is used by the interviewer to evaluate the applicant.

The assessment can include:

- Job Applicant
- Job Opening
- Interview Round
- Interview Round Type
- Interviewer
- Assessment Date
- Assessment Criteria
- Rating
- Remarks
- Weightage
- Weighted Score
- Overall Rating
- Recommendation

---

## 7. Automatic Assessment Criteria Loading

When an interview round is selected, the application automatically loads the related assessment skills and criteria.

This helps to:

- Reduce manual data entry
- Maintain consistency
- Improve assessment accuracy
- Save interviewer time

---

## 8. Weighted Score Calculation

The application automatically calculates the weighted score based on the rating and weightage.

### Formula

```text
Weighted Score = (Rating × Weightage) / 100
