const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('./models/Lead');
const Account = require('./models/Account');
const Dossier = require('./models/Dossier');
const Log = require('./models/Log');
const User = require('./models/User'); // Import User model
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Helper to generate random date within last N days
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  return date;
};

// Import Data
const importData = async () => {
  try {
    // Clear existing data
    await Lead.deleteMany();
    await Account.deleteMany();
    await Dossier.deleteMany();
    await Log.deleteMany();
    await User.deleteMany(); // Clear users

    console.log('Data Destroyed...');

    // Create Users
    const users = [
      { username: 'admin', password: 'password123', role: 'admin' },
      { username: 'sales001', password: 'password123', role: 'sales' },
      { username: 'omkar', password: 'password123', role: 'sales' },
    ];
    
    // We use create instead of insertMany to trigger the pre-save hook for password hashing
    for (const user of users) {
      await User.create(user);
    }
    console.log('Users Created...');

    // ... (leads array unchanged)
    
    // ... (accounts array unchanged)

    // ... (dossiers array unchanged)



    // Extended Leads with varied industries, locations, and company sizes
    const leads = [
      // Manufacturing leads
      { name: 'Sarah Johnson', email: 'sarah.j@techflow.com', company: 'TechFlow Systems', matchScore: 92, status: 'new', industry: 'Manufacturing', location: 'Detroit, USA', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'Mike Chen', email: 'mike@rapidscale.io', company: 'RapidScale Manufacturing', matchScore: 88, status: 'new', industry: 'Manufacturing', location: 'Shanghai, China', companySize: 'Large', createdAt: randomDate(3) },
      { name: 'Hans Mueller', email: 'h.mueller@precision.de', company: 'Precision Engineering GmbH', matchScore: 91, status: 'contacted', industry: 'Manufacturing', location: 'Munich, Germany', companySize: 'Medium', createdAt: randomDate(5) },
      { name: 'Raj Patel', email: 'raj@steelworks.in', company: 'Steelworks India', matchScore: 85, status: 'new', industry: 'Manufacturing', location: 'Mumbai, India', companySize: 'Large', createdAt: randomDate(1) },
      { name: 'Elena Volkov', email: 'elena@metalcore.ru', company: 'MetalCore Industries', matchScore: 78, status: 'qualified', industry: 'Manufacturing', location: 'Moscow, Russia', companySize: 'Medium', createdAt: randomDate(7) },
      { name: 'Tomoko Yamada', email: 't.yamada@nippon-mfg.jp', company: 'Nippon Manufacturing', matchScore: 94, status: 'new', industry: 'Manufacturing', location: 'Tokyo, Japan', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'Carlos Rodriguez', email: 'carlos@acero.mx', company: 'Acero Mexicano', matchScore: 81, status: 'contacted', industry: 'Manufacturing', location: 'Mexico City, Mexico', companySize: 'Medium', createdAt: randomDate(4) },
      { name: 'Ahmed Hassan', email: 'a.hassan@gulfsteel.ae', company: 'Gulf Steel Corp', matchScore: 87, status: 'new', industry: 'Manufacturing', location: 'Dubai, UAE', companySize: 'Large', createdAt: randomDate(1) },
      { name: 'Pierre Dubois', email: 'p.dubois@francemetal.fr', company: 'France Metal Industries', matchScore: 76, status: 'qualified', industry: 'Manufacturing', location: 'Lyon, France', companySize: 'Medium', createdAt: randomDate(6) },
      { name: 'Kim Soo-Min', email: 'kim@hyundaimfg.kr', company: 'Hyundai Manufacturing', matchScore: 93, status: 'new', industry: 'Manufacturing', location: 'Seoul, South Korea', companySize: 'Large', createdAt: randomDate(3) },
      
      // Logistics leads
      { name: 'Emily Davis', email: 'e.davis@blueocean.net', company: 'Blue Ocean Logistics', matchScore: 75, status: 'new', industry: 'Logistics', location: 'Singapore', companySize: 'Large', createdAt: randomDate(4) },
      { name: 'Alex Rivera', email: 'a.rivera@nexus.corp', company: 'Nexus Freight Corp', matchScore: 85, status: 'contacted', industry: 'Logistics', location: 'Los Angeles, USA', companySize: 'Medium', createdAt: randomDate(2) },
      { name: 'Jordan Lee', email: 'j.lee@apex.sol', company: 'Apex Shipping Solutions', matchScore: 91, status: 'new', industry: 'Logistics', location: 'Hong Kong', companySize: 'Large', createdAt: randomDate(1) },
      { name: 'Casey Jones', email: 'c.jones@horizon.log', company: 'Horizon Logistics', matchScore: 82, status: 'new', industry: 'Logistics', location: 'Rotterdam, Netherlands', companySize: 'Medium', createdAt: randomDate(5) },
      { name: 'Taylor Smith', email: 't.smith@vortex.energy', company: 'Vortex Supply Chain', matchScore: 79, status: 'qualified', industry: 'Logistics', location: 'Hamburg, Germany', companySize: 'Medium', createdAt: randomDate(8) },
      { name: 'Morgan Free', email: 'm.free@quantum.fin', company: 'Quantum Freight', matchScore: 87, status: 'new', industry: 'Logistics', location: 'London, UK', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'Wei Zhang', email: 'wei@sinofreight.cn', company: 'Sino Freight Co', matchScore: 90, status: 'contacted', industry: 'Logistics', location: 'Shenzhen, China', companySize: 'Large', createdAt: randomDate(3) },
      { name: 'Maria Santos', email: 'm.santos@latamlog.br', company: 'LATAM Logistics', matchScore: 77, status: 'new', industry: 'Logistics', location: 'São Paulo, Brazil', companySize: 'Medium', createdAt: randomDate(6) },
      
      // Technology leads
      { name: 'Jamie Bell', email: 'j.bell@nova.health', company: 'Nova Tech Solutions', matchScore: 76, status: 'new', industry: 'Technology', location: 'San Francisco, USA', companySize: 'Medium', createdAt: randomDate(3) },
      { name: 'Riley Reed', email: 'r.reed@titan.retail', company: 'Titan Software', matchScore: 84, status: 'contacted', industry: 'Technology', location: 'Austin, USA', companySize: 'Medium', createdAt: randomDate(4) },
      { name: 'Skyler Gray', email: 's.gray@aero.sys', company: 'Aero Systems Inc', matchScore: 89, status: 'new', industry: 'Technology', location: 'Seattle, USA', companySize: 'Large', createdAt: randomDate(1) },
      { name: 'Dakota Blue', email: 'd.blue@solar.tech', company: 'Solar Tech Innovations', matchScore: 93, status: 'new', industry: 'Technology', location: 'Denver, USA', companySize: 'Small', createdAt: randomDate(2) },
      { name: 'Phoenix Red', email: 'p.red@flame.mfg', company: 'Flame AI Systems', matchScore: 81, status: 'qualified', industry: 'Technology', location: 'Boston, USA', companySize: 'Small', createdAt: randomDate(7) },
      { name: 'Sage Green', email: 's.green@bio.lab', company: 'BioLab Technologies', matchScore: 78, status: 'new', industry: 'Technology', location: 'Cambridge, UK', companySize: 'Small', createdAt: randomDate(5) },
      { name: 'Priya Sharma', email: 'priya@infosys.in', company: 'Infosys Solutions', matchScore: 86, status: 'contacted', industry: 'Technology', location: 'Bangalore, India', companySize: 'Large', createdAt: randomDate(3) },
      { name: 'Liam OConnor', email: 'liam@dublintech.ie', company: 'Dublin Tech Hub', matchScore: 73, status: 'new', industry: 'Technology', location: 'Dublin, Ireland', companySize: 'Small', createdAt: randomDate(9) },
      
      // Oil & Gas leads
      { name: 'Raven Black', email: 'r.black@sec.ops', company: 'Security Energy Corp', matchScore: 95, status: 'new', industry: 'Oil & Gas', location: 'Houston, USA', companySize: 'Large', createdAt: randomDate(1) },
      { name: 'Omar Al-Rashid', email: 'omar@aramco.sa', company: 'Arabian Petroleum', matchScore: 92, status: 'contacted', industry: 'Oil & Gas', location: 'Riyadh, Saudi Arabia', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'Olga Petrova', email: 'olga@gazprom.ru', company: 'Eurasia Oil Corp', matchScore: 88, status: 'new', industry: 'Oil & Gas', location: 'St. Petersburg, Russia', companySize: 'Large', createdAt: randomDate(4) },
      { name: 'John McIntyre', email: 'john@bpoil.uk', company: 'British Petroleum UK', matchScore: 84, status: 'qualified', industry: 'Oil & Gas', location: 'Aberdeen, UK', companySize: 'Large', createdAt: randomDate(6) },
      { name: 'Ricardo Silva', email: 'r.silva@petrobras.br', company: 'Petrobras Brasil', matchScore: 79, status: 'new', industry: 'Oil & Gas', location: 'Rio de Janeiro, Brazil', companySize: 'Large', createdAt: randomDate(3) },
      { name: 'Fatima Al-Mansour', email: 'fatima@adnoc.ae', company: 'ADNOC Energy', matchScore: 91, status: 'new', industry: 'Oil & Gas', location: 'Abu Dhabi, UAE', companySize: 'Large', createdAt: randomDate(2) },
      
      // Construction leads
      { name: 'Marcus Johnson', email: 'm.johnson@buildco.us', company: 'BuildCo Construction', matchScore: 83, status: 'new', industry: 'Construction', location: 'Chicago, USA', companySize: 'Medium', createdAt: randomDate(3) },
      { name: 'Isabella Rossi', email: 'i.rossi@costruzioni.it', company: 'Costruzioni Italia', matchScore: 77, status: 'contacted', industry: 'Construction', location: 'Milan, Italy', companySize: 'Medium', createdAt: randomDate(5) },
      { name: 'Chen Wei', email: 'chen@greatwall.cn', company: 'Great Wall Construction', matchScore: 89, status: 'new', industry: 'Construction', location: 'Beijing, China', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'James Wilson', email: 'j.wilson@balfour.uk', company: 'Balfour Infrastructure', matchScore: 86, status: 'qualified', industry: 'Construction', location: 'Manchester, UK', companySize: 'Large', createdAt: randomDate(7) },
      { name: 'Ana Martinez', email: 'ana@ohl.es', company: 'OHL Construcciones', matchScore: 74, status: 'new', industry: 'Construction', location: 'Madrid, Spain', companySize: 'Medium', createdAt: randomDate(4) },
      { name: 'Yuki Tanaka', email: 'y.tanaka@obayashi.jp', company: 'Obayashi Corporation', matchScore: 91, status: 'contacted', industry: 'Construction', location: 'Osaka, Japan', companySize: 'Large', createdAt: randomDate(1) },
      
      // Finance leads
      { name: 'David Goldman', email: 'd.goldman@goldmanfin.us', company: 'Goldman Financial', matchScore: 88, status: 'new', industry: 'Finance', location: 'New York, USA', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'Sophie Laurent', email: 's.laurent@bnpparibas.fr', company: 'BNP Paribas Capital', matchScore: 82, status: 'contacted', industry: 'Finance', location: 'Paris, France', companySize: 'Large', createdAt: randomDate(4) },
      { name: 'Wolfgang Schmidt', email: 'w.schmidt@db.de', company: 'Deutsche Bank Ventures', matchScore: 79, status: 'qualified', industry: 'Finance', location: 'Frankfurt, Germany', companySize: 'Large', createdAt: randomDate(6) },
      { name: 'Li Ming', email: 'li.ming@icbc.cn', company: 'ICBC Investments', matchScore: 94, status: 'new', industry: 'Finance', location: 'Beijing, China', companySize: 'Large', createdAt: randomDate(1) },
      { name: 'Robert Chen', email: 'r.chen@hsbc.hk', company: 'HSBC Asia Pacific', matchScore: 87, status: 'new', industry: 'Finance', location: 'Hong Kong', companySize: 'Large', createdAt: randomDate(3) },
      
      // Healthcare leads
      { name: 'Dr. Sarah Mitchell', email: 's.mitchell@mayo.org', company: 'Mayo Medical Systems', matchScore: 90, status: 'new', industry: 'Healthcare', location: 'Rochester, USA', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'Dr. Akira Suzuki', email: 'a.suzuki@takeda.jp', company: 'Takeda Pharmaceuticals', matchScore: 85, status: 'contacted', industry: 'Healthcare', location: 'Tokyo, Japan', companySize: 'Large', createdAt: randomDate(5) },
      { name: 'Emma Thompson', email: 'e.thompson@nhs.uk', company: 'NHS Tech Solutions', matchScore: 76, status: 'new', industry: 'Healthcare', location: 'London, UK', companySize: 'Medium', createdAt: randomDate(4) },
      { name: 'Dr. Anil Kumar', email: 'a.kumar@apollo.in', company: 'Apollo Hospitals Tech', matchScore: 83, status: 'qualified', industry: 'Healthcare', location: 'Chennai, India', companySize: 'Large', createdAt: randomDate(8) },
      
      // Retail leads
      { name: 'Jennifer Brown', email: 'j.brown@walmart.us', company: 'Walmart Enterprise', matchScore: 87, status: 'new', industry: 'Retail', location: 'Bentonville, USA', companySize: 'Large', createdAt: randomDate(1) },
      { name: 'Marco Bianchi', email: 'm.bianchi@luxottica.it', company: 'Luxottica Group', matchScore: 81, status: 'contacted', industry: 'Retail', location: 'Milan, Italy', companySize: 'Large', createdAt: randomDate(3) },
      { name: 'Yolanda Zhang', email: 'y.zhang@alibaba.cn', company: 'Alibaba Retail', matchScore: 93, status: 'new', industry: 'Retail', location: 'Hangzhou, China', companySize: 'Large', createdAt: randomDate(2) },
      { name: 'Peter Müller', email: 'p.muller@lidl.de', company: 'Lidl Digital', matchScore: 78, status: 'new', industry: 'Retail', location: 'Neckarsulm, Germany', companySize: 'Large', createdAt: randomDate(5) },
    ];

    const accountOwners = ['Rahul Sharma', 'Sarah Jenkins', 'Mike Ross', 'Jessica Pearson', 'Harvey Specter'];
    const getRandomOwner = () => accountOwners[Math.floor(Math.random() * accountOwners.length)];

    // Extended Accounts with lastInteraction dates
    const accounts = [
      { company: 'Acme Corp', industry: 'Manufacturing', value: '$1.2M', owner: 'Rahul Sharma', status: 'Active', lastInteraction: randomDate(1) },
      { company: 'Globex Inc', industry: 'Retail', value: '$850k', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(2) },
      { company: 'Stellar Dynamics', industry: 'Technology', value: '$3.5M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(0) },
      { company: 'Omni Consumer Products', industry: 'Technology', value: '$10M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(3) },
      { company: 'Initech', industry: 'Technology', value: '$150k', owner: getRandomOwner(), status: 'Dormant', lastInteraction: randomDate(30) },
      { company: 'Hooli', industry: 'Technology', value: '$25M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(1) },
      { company: 'Pied Piper', industry: 'Technology', value: '$2.1M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(5) },
      { company: 'Soylent Corp', industry: 'Healthcare', value: '$500k', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(7) },
      { company: 'Gringotts', industry: 'Finance', value: '$8.2M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(2) },
      { company: 'Weyland-Yutani', industry: 'Manufacturing', value: '$45M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(4) },
      { company: 'Cyberdyne Systems', industry: 'Technology', value: '$15M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(1) },
      { company: 'Stark Industries', industry: 'Manufacturing', value: '$120M', owner: 'Rahul Sharma', status: 'Active', lastInteraction: randomDate(0) },
      { company: 'Wayne Enterprises', industry: 'Finance', value: '$80M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(3) },
      { company: 'Oscorp Industries', industry: 'Healthcare', value: '$35M', owner: getRandomOwner(), status: 'Dormant', lastInteraction: randomDate(45) },
      { company: 'Umbrella Corporation', industry: 'Healthcare', value: '$22M', owner: getRandomOwner(), status: 'Closed', lastInteraction: randomDate(60) },
      { company: 'LexCorp', industry: 'Technology', value: '$55M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(2) },
      { company: 'Massive Dynamic', industry: 'Technology', value: '$18M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(6) },
      { company: 'Tyrell Corporation', industry: 'Manufacturing', value: '$28M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(4) },
      { company: 'Buy n Large', industry: 'Retail', value: '$95M', owner: getRandomOwner(), status: 'Active', lastInteraction: randomDate(1) },
      { company: 'Aperture Science', industry: 'Technology', value: '$12M', owner: getRandomOwner(), status: 'Dormant', lastInteraction: randomDate(20) },
    ];

    // Extended Dossiers with industry
    const dossiers = [
      { company: 'TechFlow Systems', type: 'news', title: 'TechFlow announces Series B funding', description: 'Raised $30M to expand enterprise sales team.', date: '2 hours ago', industry: 'Manufacturing' },
      { company: 'Acme Corp', type: 'tender', title: 'RFP: Supply Chain Automation', description: 'Seeking vendors for warehouse robotics integration.', date: '1 day ago', industry: 'Manufacturing' },
      { company: 'Nexus Corp', type: 'signal', title: 'Major hiring spike in procurement', description: 'Indicates upcoming large scale purchasing cycle.', date: '3 hours ago', industry: 'Logistics' },
      { company: 'Horizon Logistics', type: 'news', title: 'Expansion into Southeast Asia', description: 'Opening 5 new distribution centers in Vietnam.', date: '5 hours ago', industry: 'Logistics' },
      { company: 'Nova Tech', type: 'tender', title: 'RFP: Hospital Management System', description: 'Modernizing patient data infrastructure across 20 facilities.', date: '12 hours ago', industry: 'Technology' },
      { company: 'Solar Tech', type: 'signal', title: 'New patent for high-efficiency cells', description: 'Potential for massive OEM integration contracts.', date: '1 day ago', industry: 'Technology' },
      { company: 'Titan Retail', type: 'news', title: 'Merger with Global Mart', description: 'Creating the largest retail entity in the region.', date: '2 days ago', industry: 'Retail' },
      { company: 'Weyland-Yutani', type: 'tender', title: 'Deep Space Mineral Extraction', description: 'Seeking partners for off-world mining equipment.', date: '1 week ago', industry: 'Manufacturing' },
      { company: 'Hooli', type: 'news', title: 'Kernel version 2.0 release', description: 'Revolutionary new mobile operating system announced.', date: '4 hours ago', industry: 'Technology' },
      { company: 'Stellar Dynamics', type: 'signal', title: 'Contract award from Space Agency', description: 'Next-gen propulsion system development finalized.', date: '1 day ago', industry: 'Technology' },
      { company: 'Arabian Petroleum', type: 'tender', title: 'Refinery Modernization Project', description: 'Major $500M refinery upgrade seeking tech partners.', date: '6 hours ago', industry: 'Oil & Gas' },
      { company: 'Great Wall Construction', type: 'news', title: 'Won Beijing Metro Extension Contract', description: 'Awarded $2B contract for new metro lines.', date: '8 hours ago', industry: 'Construction' },
      { company: 'Goldman Financial', type: 'signal', title: 'New fintech investment division', description: 'Launching dedicated fintech incubator program.', date: '1 day ago', industry: 'Finance' },
      { company: 'Mayo Medical', type: 'tender', title: 'AI Diagnostics Platform RFP', description: 'Seeking AI vendors for radiology automation.', date: '3 days ago', industry: 'Healthcare' },
      { company: 'Walmart Enterprise', type: 'news', title: 'Drone Delivery Expansion', description: 'Expanding same-day drone delivery to 50 new cities.', date: '10 hours ago', industry: 'Retail' },
    ];

    // Log Data
    const logs = [
      // Processed News
      {
        title: "TechFlow announces Series B funding",
        url: "https://techcrunch.com/2026/02/05/techflow-series-b",
        domain: "techcrunch.com",
        sourceType: "News",
        status: "Processed",
        crawlMethod: "Scraper",
        contentExcerpt: "TechFlow Systems has raised $30M in Series B funding led by Sequoia Capital to expand their enterprise sales team...",
        highlightedKeywords: ["TechFlow Systems", "$30M", "Series B", "expansion"],
        usedForLeadGeneration: true,
        inferredIndustry: "Technology",
        signalStrength: "High",
        usageDescription: "Identified high-growth signal for verified lead generation.",
        relevanceTag: "Used for lead generation",
        scrapedAt: randomDate(1),
        processedAt: new Date()
      },
      // Pending Tender
      {
        title: "RFP: Supply Chain Automation",
        url: "https://tenders.gov/opportunities/SC-2026-892",
        domain: "tenders.gov",
        sourceType: "Govt Portal",
        status: "Pending",
        crawlMethod: "API",
        contentExcerpt: "Department of Transportation seeking vendors for warehouse robotics integration and supply chain automation software...",
        highlightedKeywords: ["warehouse robotics", "automation", "consulting"],
        scrapedAt: new Date(), // Just now
        relevanceTag: "High relevance"
      },
      // Failed Blog
      {
        title: "Top 10 Manufacturing Trends 2026",
        url: "https://industry-insider.blog/manufacturing-trends",
        domain: "industry-insider.blog",
        sourceType: "Blog",
        status: "Failed",
        errorMessage: "Timeout: 403 Forbidden (Anti-bot protection)",
        crawlMethod: "Scraper",
        contentExcerpt: "",
        scrapedAt: randomDate(2)
      },
      // Processed Signal
      {
        title: "Major hiring spike in procurement",
        url: "https://linkedin.com/company/nexus-corp/jobs",
        domain: "linkedin.com",
        sourceType: "Website",
        status: "Processed",
        crawlMethod: "Scraper",
        contentExcerpt: "Nexus Corp has posted 15 new positions in their procurement and supply chain division in the last 48 hours...",
        highlightedKeywords: ["procurement", "supply chain", "hiring"],
        usedForLeadGeneration: true,
        inferredIndustry: "Logistics",
        signalStrength: "Medium",
        usageDescription: "Correlated hiring spike with potential expansion plans.",
        relevanceTag: "Used for lead generation",
        scrapedAt: randomDate(3),
        processedAt: randomDate(2)
      },
      // Reference News
      {
        title: "Global Logistics Market Report",
        url: "https://reuters.com/business/logistics-market-2026",
        domain: "reuters.com",
        sourceType: "News",
        status: "Processed",
        crawlMethod: "RSS",
        contentExcerpt: "The global logistics market is projected to grow by 5.8% in Q2 2026, driven by e-commerce expansion in SE Asia...",
        highlightedKeywords: ["logistics", "market growth", "SE Asia"],
        usedForLeadGeneration: false,
        relevanceTag: "Reference only",
        scrapedAt: randomDate(4),
        processedAt: randomDate(3)
      },
      // More Logs...
      { title: "New patent for high-efficiency cells", url: "https://patents.google.com/patent/US1234567", domain: "patents.google.com", sourceType: "Govt Portal", status: "Processed", crawlMethod: "API", contentExcerpt: "Abstract: A method for increasing solar cell efficiency by 15% using novel silicon doping techniques...", highlightedKeywords: ["solar cell", "efficiency", "patent"], usedForLeadGeneration: true, inferredIndustry: "Technology", signalStrength: "High", relevanceTag: "Used for lead generation", scrapedAt: randomDate(2) },
      { title: "Q4 Earnings Call Transcript", url: "https://seekingalpha.com/article/998877", domain: "seekingalpha.com", sourceType: "News", status: "Processed", crawlMethod: "Scraper", contentExcerpt: "CEO: We are looking to upgrade our legacy backend systems in the coming fiscal year...", highlightedKeywords: ["upgrade", "legacy systems", "backend"], usedForLeadGeneration: true, inferredIndustry: "Finance", signalStrength: "Medium", relevanceTag: "Used for lead generation", scrapedAt: randomDate(5) },
      { title: "Construction Permit: Downtown Highrise", url: "https://cityplanning.sf.gov/permits/2026-992", domain: "sf.gov", sourceType: "Govt Portal", status: "Pending", crawlMethod: "Scraper", contentExcerpt: "Permit application for 45-story mixed-use building at 500 Market St...", highlightedKeywords: ["construction", "permit", "highrise"], scrapedAt: randomDate(1), relevanceTag: "High relevance" },
      { title: "Retail Tech Expo 2026 Exhibitors", url: "https://retailtechexpo.com/exhibitors", domain: "retailtechexpo.com", sourceType: "Website", status: "Processed", crawlMethod: "Scraper", contentExcerpt: "List of 500+ exhibitors showcasing AI-driven retail solutions...", highlightedKeywords: ["AI", "retail", "exhibitors"], usedForLeadGeneration: false, relevanceTag: "Reference only", scrapedAt: randomDate(6) },
      { title: "Healthcare AI Regulations Draft", url: "https://fda.gov/news/ai-regulations", domain: "fda.gov", sourceType: "Govt Portal", status: "Processed", crawlMethod: "API", contentExcerpt: "Draft guidance for AI/ML-based medical software...", highlightedKeywords: ["AI", "medical software", "regulation"], usedForLeadGeneration: false, relevanceTag: "Reference only", scrapedAt: randomDate(7) },
      { title: "Oil Prices Surge on Geopolitical Risk", url: "https://bloomberg.com/energy/oil-surge", domain: "bloomberg.com", sourceType: "News", status: "Processed", crawlMethod: "RSS", contentExcerpt: "Brent crude tops $90 as tensions rise...", highlightedKeywords: ["oil", "prices", "geopolitical"], usedForLeadGeneration: false, relevanceTag: null, scrapedAt: randomDate(1) },
      { title: "Invalid RSS Feed Format", url: "https://broken-site.com/feed.xml", domain: "broken-site.com", sourceType: "Blog", status: "Failed", errorMessage: "XML Parse Error: Unexpected token <", crawlMethod: "RSS", contentExcerpt: "", scrapedAt: randomDate(0) },
    ];

    await Lead.insertMany(leads);
    await Account.insertMany(accounts);
    await Dossier.insertMany(dossiers);
    await Log.insertMany(logs);

    console.log(`Data Imported! ${leads.length} leads, ${accounts.length} accounts, ${dossiers.length} dossiers, ${logs.length} logs`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run
importData();
