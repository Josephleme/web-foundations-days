# School Enrollment System Database Design

## Table Explanations

### students
- Purpose: Stores essential profile records for individuals enrolled in the institution.
- Core Columns: Holds a unique tracking ID, the student's legal name, and an application-wide unique email address.

### courses
- Purpose: Catalogs the educational classes available to be taken within the system.
- Core Columns: Tracks the individual database record key, the title of the course, and the credit weights assigned to it.

### enrolments
- Purpose: Operates as an intersection record tracker mapping performance marks directly to dynamic pairings of students and courses.
- Core Columns: Employs a composite structure utilizing the distinct primary identifiers of the connected tables alongside an optional evaluation metric value placeholder.

## Relationships

- Students to Enrolments: This is a one-to-many relationship. A single student profile record can map forward onto multiple separate enrollment registrations over time.
- Courses to Enrolments: This is a one-to-many relationship. A single isolated course record can be listed across multiple distinct student academic entries simultaneously.
- Students to Courses: This constitutes a many-to-many relationship. Multiple independent individuals take many different subjects. Relational database engines cannot natively store multi-valued arrays directly inside a standard column cell without creating structural duplication anomalies. A dedicated intermediary join table is required to resolve this layout by splitting the complex grid into two structured one-to-many linkages, enforcing composite key uniqueness rules across data pairings.

## Optimization Strategy

### Proposed Index
- Target Element: CREATE INDEX idx_enrolments_course ON enrolments(course_id);
- Justification: When generating administrative list rosters or calculating statistical summaries via aggregation queries, filtering assignments search heavily against target classes. An indexing strategy targeting the foreign key field drastically mitigates the processing overhead of structural table scans during large execution lookups.

## Architecture Selection Profile

A relational SQL engine format represents the ideal structure selection choice for this student registration tracking system infrastructure. The operational framework exhibits highly structured parameters, demanding absolute enforcement of data consistency rules, clean multi-table joins, and distinct transaction assurances. Utilizing explicit constraints guarantees that orphan courses cannot exist without target entries and safeguards email unique parameters cleanly across files, avoiding the structural duplication drawbacks commonly found inside loose document collections.
