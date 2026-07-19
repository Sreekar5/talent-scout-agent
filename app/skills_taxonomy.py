"""Curated skills vocabulary used for explainable skill extraction and matching."""

SKILLS_TAXONOMY = {
    "languages": [
        "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "C",
        "Go", "Golang", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Scala",
        "R", "MATLAB", "SQL", "Perl", "Bash", "Shell Scripting", "HTML", "CSS",
    ],
    "frameworks_libraries": [
        "React", "React Native", "Angular", "Vue.js", "Next.js", "Node.js",
        "Express.js", "Django", "Flask", "FastAPI", "Spring", "Spring Boot",
        ".NET", "ASP.NET", "Ruby on Rails", "jQuery", "Redux", "GraphQL",
        "REST API", "Pandas", "NumPy", "Scikit-learn", "TensorFlow",
        "PyTorch", "Keras", "OpenCV", "Tailwind CSS", "Bootstrap",
    ],
    "data_ml": [
        "Machine Learning", "Deep Learning", "Natural Language Processing",
        "NLP", "Computer Vision", "Data Analysis", "Data Engineering",
        "Data Science", "Data Visualization", "ETL", "A/B Testing",
        "Statistics", "Predictive Modeling", "Big Data", "Spark",
        "PySpark", "Hadoop", "Tableau", "Power BI", "Looker",
    ],
    "cloud_devops": [
        "AWS", "Azure", "Google Cloud Platform", "GCP", "Docker",
        "Kubernetes", "Terraform", "Ansible", "Jenkins", "CI/CD",
        "GitHub Actions", "GitLab CI", "CircleCI", "Linux", "Nginx",
        "Microservices", "Serverless", "Lambda", "Helm",
        "Prometheus", "Grafana",
    ],
    "databases": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
        "Elasticsearch", "DynamoDB", "Cassandra", "Oracle",
        "SQL Server", "Firebase", "Snowflake", "BigQuery", "Neo4j",
    ],
    "tools": [
        "Git", "GitHub", "GitLab", "Jira", "Confluence", "Figma",
        "Postman", "VS Code", "IntelliJ", "Webpack", "Vite",
    ],
    "methodologies": [
        "Agile", "Scrum", "Kanban", "TDD", "DevOps",
        "System Design", "API Design", "Design Patterns",
    ],
    "product_design": [
        "Product Management", "UX Design", "UI Design", "User Research",
        "Wireframing", "Prototyping", "Roadmapping", "User Stories",
    ],
    "business_soft": [
        "Project Management", "Team Leadership", "Communication",
        "Stakeholder Management", "Mentoring", "Public Speaking",
        "Negotiation", "Strategic Planning",
    ],
}

# Flat list sorted longest-first so multi-word skills match before
# their shorter substrings (e.g. "Spring Boot" before "Spring")
ALL_SKILLS = sorted(
    {skill for skills in SKILLS_TAXONOMY.values() for skill in skills},
    key=len,
    reverse=True,
)

SKILL_LOOKUP = {s.lower(): s for s in ALL_SKILLS}