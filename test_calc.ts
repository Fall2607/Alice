import pool from './src/app/lib/db';

async function testCalc() {
    const applicant = {
        education: {
            formal: [
                { level: "S1", major: "Teknik Informatika", ipk: "3.85" }
            ]
        }
    };
    
    const config = {
        "S3": 100,
        "S2": 100,
        "S1": 80,
        "D3": 40,
        "SMA": 0,
        "SMK": 0,
        "keywords": "Informatika, Komputer, Sistem Informasi, Software"
    };

    const formalEdus = applicant.education?.formal || [];
    let bestScore = 0.0;
    
    for (const edu of formalEdus) {
        const level = edu.level || "";
        const major = (edu.major || "").toLowerCase();
        const ipk = parseFloat(edu.ipk) || 0;

        const keywordsStr = config.keywords || "";
        const relevantMajors = keywordsStr.split(",").map((k: string) => k.trim().toLowerCase()).filter((k: string) => k.length > 0);
        
        let isRelevantMajor = true;
        if (relevantMajors.length > 0 && major) {
            isRelevantMajor = relevantMajors.some((m: string) => major.includes(m));
        }

        if (!isRelevantMajor) continue;

        let eduScore = parseFloat((config as any)[level]) || 0.0;
        
        if (eduScore > bestScore) {
            bestScore = eduScore;
        }
    }
    
    console.log("Best Score calculated:", bestScore);
    process.exit(0);
}

testCalc();
