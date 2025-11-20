const bcrypt = require('bcryptjs');
const { sequelize, User, PromptTemplate } = require('./models/index.js');

const seedData = {
    user: {
        email: 'demo@promptchan.com',
        username: 'demo_user',
        password: 'password123' // Will be hashed
    },
    prompts: [
        {
            "title": "Email Response Assistant",
            "short_description": "Craft professional and effective email responses for various situations.",
            "long_description": "Generate well-structured, contextually appropriate email responses for business communications, customer inquiries, or personal matters. Save time while maintaining professionalism and clarity in your correspondence.",
            "template": "Compose a professional email response to the following situation:\n\n**Sender:** {{sender_role}}\n**Subject:** {{email_subject}}\n**Original message summary:** {{message_summary}}\n**Key points to address:** {{key_points}}\n**Desired outcome:** {{desired_outcome}}\n**Tone:** {{tone}}\n\nCreate a response that is:\n- Clear and concise\n- Professional yet {{tone}}\n- Addresses all key points\n- Includes a clear next step or call to action\n\nKeep it under {{word_count}} words.",
            "inputs": JSON.stringify([
                {
                    "name": "sender_role",
                    "type": "text",
                    "label": "Sender's Role",
                    "description": "Who sent the original email?",
                    "placeholder": "e.g., Client, Manager, Customer Service, HR",
                    "required": true
                },
                {
                    "name": "email_subject",
                    "type": "text",
                    "label": "Email Subject",
                    "description": "The subject line of the original email",
                    "placeholder": "e.g., Project Update, Complaint, Meeting Request",
                    "required": true
                },
                {
                    "name": "message_summary",
                    "type": "textarea",
                    "label": "Message Summary",
                    "description": "Brief summary of the original email content",
                    "placeholder": "What was the main content of the email?",
                    "required": true
                },
                {
                    "name": "key_points",
                    "type": "textarea",
                    "label": "Key Points to Address",
                    "description": "Specific points that need to be addressed in your response",
                    "placeholder": "List the main issues or questions to address",
                    "required": true
                },
                {
                    "name": "desired_outcome",
                    "type": "text",
                    "label": "Desired Outcome",
                    "description": "What do you want to achieve with this response?",
                    "placeholder": "e.g., Schedule a meeting, Provide information, Resolve an issue",
                    "required": true
                },
                {
                    "name": "tone",
                    "type": "text",
                    "label": "Response Tone",
                    "description": "Desired tone for your response",
                    "placeholder": "e.g., formal, friendly, apologetic, assertive",
                    "required": false
                },
                {
                    "name": "word_count",
                    "type": "text",
                    "label": "Word Count Limit",
                    "description": "Maximum word count for the response",
                    "placeholder": "e.g., 200, 300, 500",
                    "required": false
                }
            ]),
            "tags": "email,communication,business,professional",
            "visibility": "public"
        },
        {
            "title": "Data Analysis Report Generator",
            "short_description": "Transform raw data into comprehensive analysis reports with insights and recommendations.",
            "long_description": "Create professional data analysis reports that translate complex datasets into actionable insights. Perfect for business analysts, researchers, or anyone who needs to communicate data-driven findings effectively.",
            "template": "Generate a comprehensive data analysis report based on the following information:\n\n**Dataset:** {{dataset_description}}\n**Analysis Objective:** {{objective}}\n**Key Variables:** {{key_variables}}\n**Time Period:** {{time_period}}\n**Target Audience:** {{audience}}\n\nInclude these sections:\n\n1. **Executive Summary**: Key findings in 2-3 sentences\n2. **Data Overview**: Description of the dataset and methodology\n3. **Key Findings**: 3-5 most important insights with supporting data\n4. **Trend Analysis**: Patterns, changes, or correlations identified\n5. **Implications**: What these findings mean for the business/project\n6. **Recommendations**: 3-4 actionable next steps based on the analysis\n7. **Limitations**: Any constraints or caveats in the analysis\n\nFormat as a professional report with clear headings and bullet points where appropriate.",
            "inputs": JSON.stringify([
                {
                    "name": "dataset_description",
                    "type": "textarea",
                    "label": "Dataset Description",
                    "description": "Brief description of the data being analyzed",
                    "placeholder": "e.g., Monthly sales data, Customer survey responses, Website analytics",
                    "required": true
                },
                {
                    "name": "objective",
                    "type": "text",
                    "label": "Analysis Objective",
                    "description": "What you're trying to achieve with this analysis",
                    "placeholder": "e.g., Identify sales trends, Understand customer satisfaction, Optimize marketing channels",
                    "required": true
                },
                {
                    "name": "key_variables",
                    "type": "text",
                    "label": "Key Variables",
                    "description": "Main variables or metrics being analyzed",
                    "placeholder": "e.g., Revenue, Customer satisfaction score, Conversion rate",
                    "required": true
                },
                {
                    "name": "time_period",
                    "type": "text",
                    "label": "Time Period",
                    "description": "The timeframe covered by the data",
                    "placeholder": "e.g., Q1 2023, Last 12 months, January-June",
                    "required": true
                },
                {
                    "name": "audience",
                    "type": "text",
                    "label": "Target Audience",
                    "description": "Who will be reading this report?",
                    "placeholder": "e.g., Executive team, Marketing department, External stakeholders",
                    "required": true
                }
            ]),
            "tags": "data,analysis,report,business,insights",
            "visibility": "public"
        },
        {
            "title": "Interview Question Generator",
            "short_description": "Create tailored interview questions for specific roles and experience levels.",
            "long_description": "Generate comprehensive sets of interview questions designed to assess candidates for specific positions. Includes behavioral, technical, and situational questions tailored to your industry and role requirements.",
            "template": "Generate a comprehensive set of interview questions for a {{position}} position.\n\n**Role Details:**\n- Industry: {{industry}}\n- Experience Level: {{experience_level}}\n- Key Responsibilities: {{responsibilities}}\n- Required Skills: {{skills}}\n- Interview Type: {{interview_type}}\n\nCreate:\n\n1. **Opening Questions**: 2-3 icebreakers to get the conversation started\n2. **Experience Questions**: 4-5 questions about past work and achievements\n3. **Behavioral Questions**: 5-6 questions using the STAR method framework\n4. **Technical Questions**: 4-5 role-specific technical questions\n5. **Situational Questions**: 3-4 hypothetical scenarios relevant to the role\n6. **Cultural Fit Questions**: 3-4 questions about teamwork and values\n7. **Closing Questions**: 2-3 questions to wrap up the interview\n\nInclude guidance on what to look for in ideal answers.",
            "inputs": JSON.stringify([
                {
                    "name": "position",
                    "type": "text",
                    "label": "Position Title",
                    "description": "The job title you're hiring for",
                    "placeholder": "e.g., Senior Software Engineer, Marketing Manager, Sales Representative",
                    "required": true
                },
                {
                    "name": "industry",
                    "type": "text",
                    "label": "Industry",
                    "description": "The industry or sector",
                    "placeholder": "e.g., Technology, Healthcare, Finance, Retail",
                    "required": true
                },
                {
                    "name": "experience_level",
                    "type": "text",
                    "label": "Experience Level",
                    "description": "Required experience for the role",
                    "placeholder": "e.g., Entry-level, Mid-level, Senior, Executive",
                    "required": true
                },
                {
                    "name": "responsibilities",
                    "type": "textarea",
                    "label": "Key Responsibilities",
                    "description": "Main duties and responsibilities of the role",
                    "placeholder": "List the primary responsibilities and tasks",
                    "required": true
                },
                {
                    "name": "skills",
                    "type": "text",
                    "label": "Required Skills",
                    "description": "Key skills needed for success in this role",
                    "placeholder": "e.g., Project management, Data analysis, Customer service, Programming languages",
                    "required": true
                },
                {
                    "name": "interview_type",
                    "type": "text",
                    "label": "Interview Type",
                    "description": "Type of interview this is for",
                    "placeholder": "e.g., Phone screening, First round, Technical assessment, Final interview",
                    "required": false
                }
            ]),
            "tags": "hiring,interview,hr,recruitment,questions",
            "visibility": "public"
        },
        {
            "title": "Personal Finance Advisor",
            "short_description": "Get personalized financial advice and budgeting strategies based on your financial situation.",
            "long_description": "Receive tailored financial guidance to help you manage money, save for goals, and make informed financial decisions. This prompt analyzes your financial situation and provides actionable advice for improving your financial health.",
            "template": "Provide personalized financial advice based on the following information:\n\n**Financial Profile:**\n- Age: {{age}}\n- Income: {{income}}\n- Monthly expenses: {{expenses}}\n- Current savings: {{savings}}\n- Debt: {{debt}}\n- Financial goals: {{goals}}\n- Risk tolerance: {{risk_tolerance}}\n\nPlease provide:\n\n1. **Financial Health Assessment**: Current financial situation analysis\n2. **Budget Optimization**: Suggestions for improving monthly budget\n3. **Savings Strategy**: Recommendations for building emergency fund and saving for goals\n4. **Debt Management**: Strategy for paying down existing debt\n5. **Investment Recommendations**: Appropriate investment options based on risk tolerance\n6. **Long-term Planning**: Suggestions for retirement and other long-term goals\n7. **Action Plan**: Step-by-step implementation guide\n\nProvide specific, actionable advice with realistic timelines.",
            "inputs": JSON.stringify([
                {
                    "name": "age",
                    "type": "text",
                    "label": "Age",
                    "description": "Your current age",
                    "placeholder": "e.g., 25, 35, 45",
                    "required": true
                },
                {
                    "name": "income",
                    "type": "text",
                    "label": "Monthly Income",
                    "description": "Your total monthly income after taxes",
                    "placeholder": "e.g., $3,000, $5,500, $8,000",
                    "required": true
                },
                {
                    "name": "expenses",
                    "type": "text",
                    "label": "Monthly Expenses",
                    "description": "Your total monthly expenses",
                    "placeholder": "e.g., $2,500, $4,000, $6,500",
                    "required": true
                },
                {
                    "name": "savings",
                    "type": "text",
                    "label": "Current Savings",
                    "description": "Amount currently saved",
                    "placeholder": "e.g., $1,000, $10,000, $50,000",
                    "required": true
                },
                {
                    "name": "debt",
                    "type": "text",
                    "label": "Current Debt",
                    "description": "Total amount of debt you currently have",
                    "placeholder": "e.g., $5,000 in credit cards, $15,000 in student loans",
                    "required": true
                },
                {
                    "name": "goals",
                    "type": "textarea",
                    "label": "Financial Goals",
                    "description": "Your short and long-term financial goals",
                    "placeholder": "e.g., Buy a house in 5 years, Save for retirement, Build emergency fund",
                    "required": true
                },
                {
                    "name": "risk_tolerance",
                    "type": "text",
                    "label": "Risk Tolerance",
                    "description": "How comfortable are you with financial risk?",
                    "placeholder": "e.g., Conservative, Moderate, Aggressive",
                    "required": false
                }
            ]),
            "tags": "finance,personal-finance,budgeting,financial-planning",
            "visibility": "public"
        },
        {
            "title": "Recipe Creator",
            "short_description": "Generate unique recipes based on ingredients you have and dietary preferences.",
            "long_description": "Create custom recipes using ingredients you already have while accommodating dietary restrictions and preferences. Perfect for reducing food waste and discovering new meal ideas tailored to your needs.",
            "template": "Create a unique recipe using the following information:\n\n**Available Ingredients:** {{ingredients}}\n**Dietary Restrictions:** {{dietary_restrictions}}\n**Meal Type:** {{meal_type}}\n**Cuisine Preference:** {{cuisine}}\n**Cooking Skill Level:** {{skill_level}}\n**Time Available:** {{time_limit}}\n**Servings Needed:** {{servings}}\n\nPlease provide:\n\n1. **Recipe Name**: Creative name for the dish\n2. **Prep Time**: Time needed for preparation\n3. **Cook Time**: Time needed for cooking\n4. **Ingredients List**: Specific quantities with measurements\n5. **Equipment Needed**: Kitchen tools required\n6. **Step-by-Step Instructions**: Clear, numbered cooking instructions\n7. **Chef's Tips**: Suggestions for variations or improvements\n8. **Nutritional Information**: Approximate calories and macronutrients\n\nMake it delicious and achievable for the specified skill level.",
            "inputs": JSON.stringify([
                {
                    "name": "ingredients",
                    "type": "textarea",
                    "label": "Available Ingredients",
                    "description": "List the ingredients you have available",
                    "placeholder": "e.g., Chicken breast, rice, bell peppers, onions, garlic, tomatoes",
                    "required": true
                },
                {
                    "name": "dietary_restrictions",
                    "type": "text",
                    "label": "Dietary Restrictions",
                    "description": "Any dietary restrictions or preferences",
                    "placeholder": "e.g., Vegetarian, Gluten-free, Dairy-free, Low-carb",
                    "required": false
                },
                {
                    "name": "meal_type",
                    "type": "text",
                    "label": "Meal Type",
                    "description": "What type of meal is this?",
                    "placeholder": "e.g., Breakfast, Lunch, Dinner, Snack, Dessert",
                    "required": true
                },
                {
                    "name": "cuisine",
                    "type": "text",
                    "label": "Cuisine Preference",
                    "description": "Preferred cuisine style",
                    "placeholder": "e.g., Italian, Mexican, Asian, Mediterranean, American",
                    "required": false
                },
                {
                    "name": "skill_level",
                    "type": "text",
                    "label": "Cooking Skill Level",
                    "description": "Your cooking expertise",
                    "placeholder": "e.g., Beginner, Intermediate, Advanced",
                    "required": false
                },
                {
                    "name": "time_limit",
                    "type": "text",
                    "label": "Time Available",
                    "description": "Maximum time you have for cooking",
                    "placeholder": "e.g., 30 minutes, 1 hour, 2 hours",
                    "required": false
                },
                {
                    "name": "servings",
                    "type": "text",
                    "label": "Servings Needed",
                    "description": "How many people will this serve?",
                    "placeholder": "e.g., 1, 2, 4, 6",
                    "required": false
                }
            ]),
            "tags": "recipe,cooking,food,meal-planning",
            "visibility": "public"
        },
        {
            "title": "Product Feature Prioritizer",
            "short_description": "Evaluate and prioritize product features based on impact, effort, and strategic alignment.",
            "long_description": "Make data-informed decisions about which product features to build next. This prompt helps you evaluate potential features against multiple criteria to create a prioritized roadmap that aligns with your business goals.",
            "template": "Help me prioritize these product features based on the following criteria:\n\n**Product:** {{product_name}}\n**Target Users:** {{target_users}}\n**Business Goals:** {{business_goals}}\n**Available Resources:** {{resources}}\n\n**Features to Evaluate:**\n{{feature_list}}\n\nFor each feature, please analyze:\n\n1. **User Impact**: How much value does this provide to users?\n2. **Business Impact**: How does this align with our business goals?\n3. **Implementation Effort**: How difficult would this be to build? (High/Medium/Low)\n4. **Strategic Alignment**: How well does this fit with our product vision?\n5. **Market Differentiation**: How would this set us apart from competitors?\n6. **Technical Risk**: What are the potential technical challenges?\n\nAfter analyzing each feature, provide:\n- A prioritized ranking of all features\n- A visual matrix showing impact vs. effort\n- Recommended timeline for implementation\n- Any dependencies between features\n- Risks or considerations for the top priorities",
            "inputs": JSON.stringify([
                {
                    "name": "product_name",
                    "type": "text",
                    "label": "Product Name",
                    "description": "Name of your product",
                    "placeholder": "e.g., Mobile App, SaaS Platform, E-commerce Website",
                    "required": true
                },
                {
                    "name": "target_users",
                    "type": "text",
                    "label": "Target Users",
                    "description": "Who uses your product?",
                    "placeholder": "e.g., Small business owners, Freelancers, Enterprise customers",
                    "required": true
                },
                {
                    "name": "business_goals",
                    "type": "textarea",
                    "label": "Business Goals",
                    "description": "What are your main business objectives?",
                    "placeholder": "e.g., Increase user retention, Expand market share, Improve conversion rates",
                    "required": true
                },
                {
                    "name": "resources",
                    "type": "text",
                    "label": "Available Resources",
                    "description": "What resources do you have for development?",
                    "placeholder": "e.g., 3 developers, 1 designer, 3-month timeline",
                    "required": true
                },
                {
                    "name": "feature_list",
                    "type": "textarea",
                    "label": "Features to Evaluate",
                    "description": "List all features you're considering",
                    "placeholder": "e.g., 1. User dashboard analytics, 2. Integration with third-party tools, 3. Mobile app version",
                    "required": true
                }
            ]),
            "tags": "product-management,prioritization,roadmap,strategy",
            "visibility": "public"
        },
        {
            "title": "Travel Itinerary Planner",
            "short_description": "Create personalized travel itineraries with recommendations for activities, dining, and accommodations.",
            "long_description": "Generate comprehensive travel plans tailored to your interests, budget, and travel style. Includes day-by-day activities, dining recommendations, and practical travel tips to make your trip memorable and stress-free.",
            "template": "Create a detailed travel itinerary for:\n\n**Destination:** {{destination}}\n**Duration:** {{duration}}\n**Travel Style:** {{travel_style}}\n**Budget:** {{budget}}\n**Interests:** {{interests}}\n**Group Composition:** {{group_info}}\n**Special Requirements:** {{special_requirements}}\n\nPlease include:\n\n1. **Overview**: Brief summary of the trip and highlights\n2. **Day-by-Day Itinerary**: Specific activities and attractions for each day\n3. **Dining Recommendations**: Restaurant suggestions for different meals\n4. **Accommodation Options**: 2-3 suggestions for places to stay\n5. **Transportation**: How to get around the destination\n6. **Packing Tips**: What to bring based on weather and activities\n7. **Local Customs**: Important cultural information\n8. **Budget Breakdown**: Estimated costs for different aspects of the trip\n9. **Contingency Plans**: Alternative activities in case of bad weather or closures\n\nMake it practical and exciting!",
            "inputs": JSON.stringify([
                {
                    "name": "destination",
                    "type": "text",
                    "label": "Destination",
                    "description": "Where are you traveling to?",
                    "placeholder": "e.g., Paris, Tokyo, Costa Rica, New York City",
                    "required": true
                },
                {
                    "name": "duration",
                    "type": "text",
                    "label": "Trip Duration",
                    "description": "How long is your trip?",
                    "placeholder": "e.g., 3 days, 1 week, 10 days, 2 weeks",
                    "required": true
                },
                {
                    "name": "travel_style",
                    "type": "text",
                    "label": "Travel Style",
                    "description": "What type of traveler are you?",
                    "placeholder": "e.g., Budget, Mid-range, Luxury, Adventure, Relaxation",
                    "required": true
                },
                {
                    "name": "budget",
                    "type": "text",
                    "label": "Budget",
                    "description": "Your approximate budget for the trip",
                    "placeholder": "e.g., $500, $1,500, $3,000+",
                    "required": true
                },
                {
                    "name": "interests",
                    "type": "textarea",
                    "label": "Interests",
                    "description": "What activities or attractions interest you?",
                    "placeholder": "e.g., Museums, Hiking, Food tours, Nightlife, Shopping, Historical sites",
                    "required": true
                },
                {
                    "name": "group_info",
                    "type": "text",
                    "label": "Group Composition",
                    "description": "Who is traveling?",
                    "placeholder": "e.g., Solo traveler, Couple with kids, Group of friends, Family with elderly parents",
                    "required": true
                },
                {
                    "name": "special_requirements",
                    "type": "textarea",
                    "label": "Special Requirements",
                    "description": "Any special needs or preferences",
                    "placeholder": "e.g., Dietary restrictions, Accessibility needs, Language preferences",
                    "required": false
                }
            ]),
            "tags": "travel,planning,itinerary,vacation",
            "visibility": "public"
        },
        {
            "title": "Research Paper Summarizer",
            "short_description": "Extract key insights and create concise summaries of academic or technical research papers.",
            "long_description": "Transform dense academic papers into clear, digestible summaries highlighting the most important findings, methodology, and implications. Perfect for students, researchers, or professionals who need to quickly understand research content.",
            "template": "Create a comprehensive summary of the following research paper:\n\n**Paper Title:** {{paper_title}}\n**Authors:** {{authors}}\n**Publication Year:** {{year}}\n**Field of Study:** {{field}}\n\n**Key Content:**\n{{paper_content}}\n\nPlease provide:\n\n1. **Executive Summary**: 2-3 sentence overview of the paper\n2. **Research Question**: What problem or question is being addressed?\n3. **Methodology**: How was the research conducted?\n4. **Key Findings**: Main results and discoveries\n5. **Implications**: Why these findings matter\n6. **Limitations**: Constraints or weaknesses in the research\n7. **Future Research**: Suggested directions for further study\n8. **Practical Applications**: How this research could be applied\n9. **Key Quotes**: 2-3 significant quotes from the paper\n\nMake the summary accessible to someone with {{audience_knowledge}} knowledge of the field.",
            "inputs": JSON.stringify([
                {
                    "name": "paper_title",
                    "type": "text",
                    "label": "Paper Title",
                    "description": "Title of the research paper",
                    "placeholder": "e.g., The Impact of Remote Work on Employee Productivity",
                    "required": true
                },
                {
                    "name": "authors",
                    "type": "text",
                    "label": "Authors",
                    "description": "Authors of the paper",
                    "placeholder": "e.g., Smith, J., Johnson, M., Williams, R.",
                    "required": true
                },
                {
                    "name": "year",
                    "type": "text",
                    "label": "Publication Year",
                    "description": "When was the paper published?",
                    "placeholder": "e.g., 2022, 2021, 2020",
                    "required": true
                },
                {
                    "name": "field",
                    "type": "text",
                    "label": "Field of Study",
                    "description": "Academic or research field",
                    "placeholder": "e.g., Psychology, Computer Science, Biology, Economics",
                    "required": true
                },
                {
                    "name": "paper_content",
                    "type": "textarea",
                    "label": "Paper Content",
                    "description": "Key sections or content from the paper",
                    "placeholder": "Paste abstract, introduction, methodology, results, and conclusion sections",
                    "required": true
                },
                {
                    "name": "audience_knowledge",
                    "type": "text",
                    "label": "Audience Knowledge Level",
                    "description": "Target audience's familiarity with the field",
                    "placeholder": "e.g., No prior knowledge, Basic understanding, Expert level",
                    "required": false
                }
            ]),
            "tags": "research,academic,summarization,science",
            "visibility": "public"
        },
        {
            "title": "Customer Journey Mapper",
            "short_description": "Visualize and analyze the complete customer journey to identify pain points and opportunities.",
            "long_description": "Create detailed customer journey maps that help you understand how customers interact with your business across all touchpoints. Identify pain points, opportunities for improvement, and moments that matter most to your customers.",
            "template": "Create a comprehensive customer journey map for:\n\n**Business/Product:** {{business_name}}\n**Customer Persona:** {{customer_persona}}\n**Journey Purpose:** {{journey_purpose}}\n**Key Touchpoints:** {{touchpoints}}\n\nPlease include:\n\n1. **Persona Overview**: Brief description of the customer\n2. **Journey Phases**: Break down the journey into logical stages\n3. **Customer Actions**: What the customer does at each stage\n4. **Customer Thoughts & Feelings**: Emotional journey throughout the process\n5. **Pain Points**: Frustrations or challenges the customer experiences\n6. **Opportunities**: Areas for improvement or innovation\n7. **Channels**: Where interactions take place (website, app, in-person, etc.)\n8. **Metrics**: KPIs to measure success at each stage\n9. **Improvement Recommendations**: Specific actions to enhance the experience\n\nFocus on creating a seamless experience that builds loyalty and satisfaction.",
            "inputs": JSON.stringify([
                {
                    "name": "business_name",
                    "type": "text",
                    "label": "Business/Product Name",
                    "description": "Name of your business or product",
                    "placeholder": "e.g., E-commerce Store, Mobile Banking App, Restaurant Chain",
                    "required": true
                },
                {
                    "name": "customer_persona",
                    "type": "textarea",
                    "label": "Customer Persona",
                    "description": "Description of your target customer",
                    "placeholder": "e.g., Tech-savvy millennials, Budget-conscious families, Busy professionals",
                    "required": true
                },
                {
                    "name": "journey_purpose",
                    "type": "text",
                    "label": "Journey Purpose",
                    "description": "What customer journey are you mapping?",
                    "placeholder": "e.g., Purchase process, Onboarding, Support request, Loyalty program",
                    "required": true
                },
                {
                    "name": "touchpoints",
                    "type": "textarea",
                    "label": "Key Touchpoints",
                    "description": "Where do customers interact with your business?",
                    "placeholder": "e.g., Website, Mobile app, Physical store, Customer service, Social media",
                    "required": true
                }
            ]),
            "tags": "customer-experience,journey-mapping,ux,research",
            "visibility": "public"
        },
        {
            "title": "Content Repurposing Strategist",
            "short_description": "Transform existing content into multiple formats to maximize reach and engagement.",
            "long_description": "Create a strategic plan to repurpose your existing content into various formats for different platforms and audiences. Extend the life of your content and reach new audiences without creating everything from scratch.",
            "template": "Create a content repurposing strategy for:\n\n**Original Content:** {{original_content}}\n**Content Type:** {{content_type}}\n**Target Platforms:** {{platforms}}\n**Audience Segments:** {{audiences}}\n**Primary Goals:** {{goals}}\n\nPlease provide:\n\n1. **Content Analysis**: Key themes and insights from the original content\n2. **Repurposing Opportunities**: 5-7 different ways to transform the content\n3. **Platform-Specific Adaptations**: How to optimize for each platform\n4. **Audience-Specific Versions**: How to tailor content for different segments\n5. **Content Calendar**: Suggested timeline for publishing repurposed content\n6. **Cross-Promotion Strategy**: How different pieces can promote each other\n7. **Performance Metrics**: How to measure success of repurposed content\n8. **Evergreen Potential**: How to make content last longer\n\nFocus on maximizing value while maintaining quality and relevance.",
            "inputs": JSON.stringify([
                {
                    "name": "original_content",
                    "type": "textarea",
                    "label": "Original Content",
                    "description": "Brief description of the content you want to repurpose",
                    "placeholder": "e.g., Blog post about productivity tips, Video tutorial on software features, Research report on industry trends",
                    "required": true
                },
                {
                    "name": "content_type",
                    "type": "text",
                    "label": "Content Type",
                    "description": "Format of the original content",
                    "placeholder": "e.g., Blog post, Video, Podcast, Whitepaper, Webinar",
                    "required": true
                },
                {
                    "name": "platforms",
                    "type": "text",
                    "label": "Target Platforms",
                    "description": "Where you want to distribute the repurposed content",
                    "placeholder": "e.g., LinkedIn, Instagram, YouTube, Email newsletter, Twitter",
                    "required": true
                },
                {
                    "name": "audiences",
                    "type": "textarea",
                    "label": "Audience Segments",
                    "description": "Different audience groups you want to reach",
                    "placeholder": "e.g., Industry professionals, Potential customers, Internal team, Partners",
                    "required": true
                },
                {
                    "name": "goals",
                    "type": "textarea",
                    "label": "Primary Goals",
                    "description": "What you want to achieve with this content",
                    "placeholder": "e.g., Increase brand awareness, Generate leads, Establish thought leadership, Educate customers",
                    "required": true
                }
            ]),
            "tags": "content-marketing,repurposing,strategy,marketing",
            "visibility": "public"
        },
        {
            "title": "API Documentation Generator",
            "short_description": "Create comprehensive API documentation with examples, parameters, and response formats.",
            "long_description": "Generate professional API documentation that makes your endpoints easy to understand and implement. Includes request/response examples, parameter descriptions, authentication details, and error handling information.",
            "template": "Create comprehensive API documentation for:\n\n**API Name:** {{api_name}}\n**API Version:** {{api_version}}\n**Base URL:** {{base_url}}\n**Authentication Method:** {{auth_method}}\n\n**Endpoints to Document:**\n{{endpoints}}\n\nFor each endpoint, please include:\n\n1. **Endpoint URL**: Full path including parameters\n2. **HTTP Method**: GET, POST, PUT, DELETE, etc.\n3. **Description**: What the endpoint does\n4. **Parameters**: All request parameters with types, requirements, and descriptions\n5. **Request Example**: Sample request with headers and body\n6. **Response Format**: Structure of successful responses\n7. **Response Example**: Sample successful response\n8. **Error Responses**: Possible error codes and messages\n9. **Rate Limiting**: Any usage limits\n10. **Code Examples**: Implementation examples in {{programming_languages}}\n\nAlso include:\n- Getting started guide\n- Authentication setup instructions\n- Common use cases\n- SDK or library information (if available)",
            "inputs": JSON.stringify([
                {
                    "name": "api_name",
                    "type": "text",
                    "label": "API Name",
                    "description": "Name of your API",
                    "placeholder": "e.g., User Management API, Payment Processing API",
                    "required": true
                },
                {
                    "name": "api_version",
                    "type": "text",
                    "label": "API Version",
                    "description": "Current version of the API",
                    "placeholder": "e.g., v1, v2.1, 3.0",
                    "required": true
                },
                {
                    "name": "base_url",
                    "type": "text",
                    "label": "Base URL",
                    "description": "Base URL for the API",
                    "placeholder": "e.g., https://api.example.com/v1",
                    "required": true
                },
                {
                    "name": "auth_method",
                    "type": "text",
                    "label": "Authentication Method",
                    "description": "How users authenticate with the API",
                    "placeholder": "e.g., API Key, OAuth 2.0, JWT Token, Basic Auth",
                    "required": true
                },
                {
                    "name": "endpoints",
                    "type": "textarea",
                    "label": "Endpoints to Document",
                    "description": "List of API endpoints and their basic functionality",
                    "placeholder": "e.g., GET /users - Retrieve user list, POST /users - Create new user, GET /users/{id} - Get specific user",
                    "required": true
                },
                {
                    "name": "programming_languages",
                    "type": "text",
                    "label": "Programming Languages",
                    "description": "Languages for code examples",
                    "placeholder": "e.g., JavaScript, Python, cURL, Ruby",
                    "required": false
                }
            ]),
            "tags": "api,documentation,development,technical-writing",
            "visibility": "public"
        },
        {
            "title": "Performance Review Assistant",
            "short_description": "Create comprehensive performance reviews with balanced feedback and development goals.",
            "long_description": "Generate structured performance reviews that provide balanced feedback, recognize achievements, and set clear development goals. Perfect for managers who want to conduct thorough, fair, and constructive performance evaluations.",
            "template": "Create a comprehensive performance review for:\n\n**Employee Name:** {{employee_name}}\n**Position:** {{position}}\n**Review Period:** {{review_period}}\n**Key Responsibilities:** {{responsibilities}}\n**Performance Goals:** {{goals}}\n**Accomplishments:** {{accomplishments}}\n**Areas for Improvement:** {{improvement_areas}}\n\nPlease include:\n\n1. **Executive Summary**: Overall performance assessment\n2. **Achievements**: Recognition of specific accomplishments and successes\n3. **Strengths**: Key skills and competencies demonstrated\n4. **Areas for Development**: Constructive feedback on areas needing improvement\n5. **Goal Progress**: Assessment of progress toward previous goals\n6. **Future Goals**: 3-5 specific, measurable goals for the next period\n7. **Development Plan**: Training, resources, or support needed\n8. **Employee Comments**: Space for employee feedback and perspective\n9. **Manager Commitments**: What the manager will provide to support success\n10. **Overall Rating**: Final performance rating with justification\n\nMaintain a {{tone}} tone throughout the review.",
            "inputs": JSON.stringify([
                {
                    "name": "employee_name",
                    "type": "text",
                    "label": "Employee Name",
                    "description": "Name of the employee being reviewed",
                    "placeholder": "e.g., Jane Smith, Michael Johnson",
                    "required": true
                },
                {
                    "name": "position",
                    "type": "text",
                    "label": "Position",
                    "description": "Employee's job title",
                    "placeholder": "e.g., Senior Developer, Marketing Manager, Sales Representative",
                    "required": true
                },
                {
                    "name": "review_period",
                    "type": "text",
                    "label": "Review Period",
                    "description": "Time period covered by the review",
                    "placeholder": "e.g., Q1 2023, January-June 2023, Annual Review 2022",
                    "required": true
                },
                {
                    "name": "responsibilities",
                    "type": "textarea",
                    "label": "Key Responsibilities",
                    "description": "Main duties and responsibilities of the position",
                    "placeholder": "List the primary responsibilities of the role",
                    "required": true
                },
                {
                    "name": "goals",
                    "type": "textarea",
                    "label": "Performance Goals",
                    "description": "Goals set for the review period",
                    "placeholder": "List the goals that were set at the beginning of the period",
                    "required": true
                },
                {
                    "name": "accomplishments",
                    "type": "textarea",
                    "label": "Accomplishments",
                    "description": "Key achievements during the review period",
                    "placeholder": "List specific accomplishments and successes",
                    "required": true
                },
                {
                    "name": "improvement_areas",
                    "type": "textarea",
                    "label": "Areas for Improvement",
                    "description": "Areas where the employee could improve",
                    "placeholder": "List specific areas needing development",
                    "required": false
                },
                {
                    "name": "tone",
                    "type": "text",
                    "label": "Review Tone",
                    "description": "Desired tone for the review",
                    "placeholder": "e.g., Encouraging, Direct, Supportive, Formal",
                    "required": false
                }
            ]),
            "tags": "hr,performance-review,management,feedback",
            "visibility": "public"
        },
        {
            "title": "Project Risk Assessment",
            "short_description": "Identify, evaluate, and create mitigation strategies for potential project risks.",
            "long_description": "Conduct comprehensive risk assessments for your projects to identify potential issues before they become problems. This prompt helps you evaluate risks by likelihood and impact, then develop effective mitigation strategies.",
            "template": "Conduct a comprehensive risk assessment for:\n\n**Project Name:** {{project_name}}\n**Project Description:** {{project_description}}\n**Timeline:** {{timeline}}\n**Budget:** {{budget}}\n**Team:** {{team}}\n**Key Stakeholders:** {{stakeholders}}\n\nPlease provide:\n\n1. **Risk Identification**: List 8-10 potential risks across categories (technical, resource, schedule, budget, etc.)\n2. **Risk Analysis**: For each risk, assess:\n   - Likelihood (High/Medium/Low)\n   - Impact (High/Medium/Low)\n   - Risk Score (Likelihood × Impact)\n3. **Risk Matrix**: Visual representation of risks by likelihood and impact\n4. **Mitigation Strategies**: Specific actions to reduce likelihood or impact\n5. **Contingency Plans**: Backup plans if risks materialize\n6. **Risk Owners**: Who is responsible for monitoring each risk\n7. **Monitoring Approach**: How and when risks will be reviewed\n8. **Top 5 Risks**: Detailed focus on the most critical risks\n\nFocus on practical, actionable strategies that can be implemented within the project constraints.",
            "inputs": JSON.stringify([
                {
                    "name": "project_name",
                    "type": "text",
                    "label": "Project Name",
                    "description": "Name of the project",
                    "placeholder": "e.g., Website Redesign, Mobile App Launch, System Migration",
                    "required": true
                },
                {
                    "name": "project_description",
                    "type": "textarea",
                    "label": "Project Description",
                    "description": "Brief description of the project",
                    "placeholder": "What is the project about and what are its main objectives?",
                    "required": true
                },
                {
                    "name": "timeline",
                    "type": "text",
                    "label": "Timeline",
                    "description": "Project timeline",
                    "placeholder": "e.g., 3 months, Q2-Q3 2023, January 1 - June 30",
                    "required": true
                },
                {
                    "name": "budget",
                    "type": "text",
                    "label": "Budget",
                    "description": "Project budget",
                    "placeholder": "e.g., $50,000, $250,000, £75,000",
                    "required": true
                },
                {
                    "name": "team",
                    "type": "text",
                    "label": "Team",
                    "description": "Project team composition",
                    "placeholder": "e.g., 5 developers, 2 designers, 1 project manager, 1 QA specialist",
                    "required": true
                },
                {
                    "name": "stakeholders",
                    "type": "text",
                    "label": "Key Stakeholders",
                    "description": "Main stakeholders involved in the project",
                    "placeholder": "e.g., Marketing department, Executive team, External clients, End users",
                    "required": true
                }
            ]),
            "tags": "project-management,risk-assessment,planning,strategy",
            "visibility": "public"
        },
        {
            "title": "Competitive Analysis Framework",
            "short_description": "Analyze competitors and identify strategic opportunities for your business.",
            "long_description": "Conduct thorough competitive analysis to understand your market position, identify competitor strengths and weaknesses, and uncover strategic opportunities. This framework helps you make informed decisions to gain competitive advantage.",
            "template": "Conduct a comprehensive competitive analysis for:\n\n**Your Business:** {{your_business}}\n**Industry:** {{industry}}\n**Target Market:** {{target_market}}\n\n**Competitors to Analyze:** {{competitors}}\n\nFor each competitor, please analyze:\n\n1. **Company Overview**: Brief background and market position\n2. **Products/Services**: What they offer and key features\n3. **Pricing Strategy**: How they price their offerings\n4. **Target Audience**: Who they primarily serve\n5. **Marketing Approach**: How they reach and engage customers\n6. **Strengths**: What they do well\n7. **Weaknesses**: Where they fall short\n8. **Market Share**: Approximate market position\n\nAfter analyzing all competitors, provide:\n- **Competitive Landscape**: Overall market dynamics\n- **Your Unique Value Proposition**: What sets you apart\n- **Market Gaps**: Unmet needs or opportunities\n- **Strategic Recommendations**: 3-5 specific actions to gain competitive advantage\n- **Threat Assessment**: Potential competitive threats to monitor\n\nFocus on actionable insights that can inform your business strategy.",
            "inputs": JSON.stringify([
                {
                    "name": "your_business",
                    "type": "text",
                    "label": "Your Business",
                    "description": "Name and brief description of your business",
                    "placeholder": "e.g., Eco-friendly home products company, B2B SaaS for small businesses",
                    "required": true
                },
                {
                    "name": "industry",
                    "type": "text",
                    "label": "Industry",
                    "description": "Your industry or sector",
                    "placeholder": "e.g., E-commerce, Software, Healthcare, Financial services",
                    "required": true
                },
                {
                    "name": "target_market",
                    "type": "textarea",
                    "label": "Target Market",
                    "description": "Your target customers",
                    "placeholder": "e.g., Environmentally conscious millennials, Small business owners, Healthcare providers",
                    "required": true
                },
                {
                    "name": "competitors",
                    "type": "textarea",
                    "label": "Competitors",
                    "description": "List your main competitors",
                    "placeholder": "e.g., Competitor A - Large corporation with wide distribution, Competitor B - Startup with innovative features",
                    "required": true
                }
            ]),
            "tags": "competitive-analysis,market-research,strategy,business",
            "visibility": "public"
        },
        {
            "title": "Personal Brand Statement Creator",
            "short_description": "Craft a compelling personal brand statement that highlights your unique value proposition.",
            "long_description": "Develop a powerful personal brand statement that communicates who you are, what you do, and what makes you unique. Perfect for professionals looking to differentiate themselves in job searches, networking, or career advancement.",
            "template": "Create a compelling personal brand statement based on the following information:\n\n**Name:** {{name}}\n**Profession/Field:** {{profession}}\n**Experience Level:** {{experience}}\n**Key Skills:** {{skills}}\n**Core Values:** {{values}}\n**Passions:** {{passions}}\n**Target Audience:** {{audience}}\n**Unique Qualities:** {{unique_qualities}}\n\nPlease provide:\n\n1. **Elevator Pitch**: A 30-second verbal introduction\n2. **Brand Statement**: A concise 2-3 sentence written statement\n3. **Tagline Options**: 3-5 memorable taglines\n4. **Bio Variations**: Different length bios for various platforms:\n   - LinkedIn summary (2-3 paragraphs)\n   - Twitter bio (160 characters)\n   - Website bio (1 paragraph)\n   - Conference speaker bio (100 words)\n5. **Value Proposition**: Clear articulation of what makes you unique\n6. **Proof Points**: Evidence that supports your brand claims\n7. **Brand Voice Guidelines**: Tone and style recommendations\n\nEnsure the brand statement is authentic, memorable, and aligned with your professional goals.",
            "inputs": JSON.stringify([
                {
                    "name": "name",
                    "type": "text",
                    "label": "Name",
                    "description": "Your full name",
                    "placeholder": "e.g., Jane Smith, Michael Johnson",
                    "required": true
                },
                {
                    "name": "profession",
                    "type": "text",
                    "label": "Profession/Field",
                    "description": "Your professional field or industry",
                    "placeholder": "e.g., Software developer, Marketing consultant, Financial analyst",
                    "required": true
                },
                {
                    "name": "experience",
                    "type": "text",
                    "label": "Experience Level",
                    "description": "Your professional experience level",
                    "placeholder": "e.g., Early career, Mid-level professional, Senior executive, Industry expert",
                    "required": true
                },
                {
                    "name": "skills",
                    "type": "textarea",
                    "label": "Key Skills",
                    "description": "Your most important professional skills",
                    "placeholder": "e.g., Data analysis, Project management, Public speaking, Strategic planning",
                    "required": true
                },
                {
                    "name": "values",
                    "type": "textarea",
                    "label": "Core Values",
                    "description": "Professional values that guide your work",
                    "placeholder": "e.g., Integrity, Innovation, Collaboration, Excellence",
                    "required": true
                },
                {
                    "name": "passions",
                    "type": "textarea",
                    "label": "Passions",
                    "description": "What you're passionate about in your field",
                    "placeholder": "e.g., Solving complex problems, Helping others succeed, Creating innovative solutions",
                    "required": true
                },
                {
                    "name": "audience",
                    "type": "text",
                    "label": "Target Audience",
                    "description": "Who you want to reach with your personal brand",
                    "placeholder": "e.g., Potential employers, Industry peers, Clients, Recruiters",
                    "required": true
                },
                {
                    "name": "unique_qualities",
                    "type": "textarea",
                    "label": "Unique Qualities",
                    "description": "What makes you different from others in your field",
                    "placeholder": "e.g., Unique background, Specialized knowledge, Distinctive approach to work",
                    "required": false
                }
            ]),
            "tags": "personal-branding,career,professional-development,marketing",
            "visibility": "public"
        },
        {
            "title": "Workshop Facilitator Guide",
            "short_description": "Create comprehensive workshop plans with activities, timing, and facilitation tips.",
            "long_description": "Design engaging workshops that achieve specific learning outcomes. This prompt helps you create detailed facilitator guides with structured activities, timing, materials, and tips to run successful interactive sessions.",
            "template": "Create a comprehensive workshop facilitator guide for:\n\n**Workshop Title:** {{workshop_title}}\n**Duration:** {{duration}}\n**Number of Participants:** {{participants}}\n**Learning Objectives:** {{objectives}}\n**Target Audience:** {{audience}}\n**Experience Level:** {{experience_level}}\n**Format:** {{format}}\n\nPlease include:\n\n1. **Workshop Overview**: Brief description and goals\n2. **Materials & Setup**: Everything needed for the workshop\n3. **Detailed Agenda**: Timed breakdown of the entire session\n4. **Introduction**: How to begin the workshop\n5. **Icebreakers**: 2-3 appropriate opening activities\n6. **Main Activities**: 3-5 core learning activities with:\n   - Detailed instructions\n   - Time allocation\n   - Group configuration\n   - Materials needed\n   - Facilitator notes\n7. **Discussion Prompts**: Questions to spark meaningful conversation\n8. **Breaks**: When and how to incorporate breaks\n9. **Wrap-up**: How to conclude the workshop\n10. **Follow-up Activities**: Post-workshop reinforcement\n11. **Troubleshooting Guide**: Common issues and solutions\n12. **Evaluation Method**: How to measure workshop success\n\nMake it engaging, interactive, and focused on achieving the learning objectives.",
            "inputs": JSON.stringify([
                {
                    "name": "workshop_title",
                    "type": "text",
                    "label": "Workshop Title",
                    "description": "Title of your workshop",
                    "placeholder": "e.g., Effective Communication Skills, Design Thinking Basics, Project Management Fundamentals",
                    "required": true
                },
                {
                    "name": "duration",
                    "type": "text",
                    "label": "Duration",
                    "description": "How long will the workshop last?",
                    "placeholder": "e.g., 2 hours, Half day, Full day, 3 days",
                    "required": true
                },
                {
                    "name": "participants",
                    "type": "text",
                    "label": "Number of Participants",
                    "description": "Expected number of attendees",
                    "placeholder": "e.g., 10-15, 20-25, 30+",
                    "required": true
                },
                {
                    "name": "objectives",
                    "type": "textarea",
                    "label": "Learning Objectives",
                    "description": "What should participants learn or be able to do after the workshop?",
                    "placeholder": "e.g., Understand key concepts, Practice specific skills, Develop action plans",
                    "required": true
                },
                {
                    "name": "audience",
                    "type": "text",
                    "label": "Target Audience",
                    "description": "Who is this workshop for?",
                    "placeholder": "e.g., New managers, Sales team, Software developers, HR professionals",
                    "required": true
                },
                {
                    "name": "experience_level",
                    "type": "text",
                    "label": "Experience Level",
                    "description": "Participants' familiarity with the topic",
                    "placeholder": "e.g., No prior knowledge, Some familiarity, Experienced practitioners",
                    "required": true
                },
                {
                    "name": "format",
                    "type": "text",
                    "label": "Format",
                    "description": "How will the workshop be delivered?",
                    "placeholder": "e.g., In-person, Virtual, Hybrid",
                    "required": false
                }
            ]),
            "tags": "workshop,facilitation,training,education",
            "visibility": "public"
        },
        {
            "title": "UX Research Plan Generator",
            "short_description": "Create comprehensive UX research plans with methods, timelines, and deliverables.",
            "long_description": "Develop structured UX research plans that address specific product questions. This prompt helps you define research objectives, select appropriate methods, and create actionable plans to gather user insights.",
            "template": "Create a comprehensive UX research plan for:\n\n**Product/Feature:** {{product_name}}\n**Research Question:** {{research_question}}\n**Project Timeline:** {{timeline}}\n**Budget:** {{budget}}\n**Target Users:** {{target_users}}\n**Current Stage:** {{product_stage}}\n\nPlease include:\n\n1. **Research Objectives**: Clear, measurable goals for the research\n2. **Research Questions**: Specific questions to be answered\n3. **Methodology**: Recommended research methods with rationale\n4. **Participant Recruitment**: Who to include and how to find them\n5. **Research Activities**: Detailed plan for each research method\n6. **Timeline**: Schedule for all research activities\n7. **Deliverables**: What will be produced and when\n8. **Team Roles**: Who will be involved and their responsibilities\n9. **Ethical Considerations**: How to protect participant privacy\n10. **Success Metrics**: How to measure the impact of the research\n11. **Risk Mitigation**: Potential challenges and backup plans\n12. **Next Steps**: How findings will be applied\n\nFocus on practical methods that will provide actionable insights within the given constraints.",
            "inputs": JSON.stringify([
                {
                    "name": "product_name",
                    "type": "text",
                    "label": "Product/Feature",
                    "description": "The product or feature being researched",
                    "placeholder": "e.g., Mobile banking app, E-commerce checkout process, Project management tool",
                    "required": true
                },
                {
                    "name": "research_question",
                    "type": "textarea",
                    "label": "Research Question",
                    "description": "Main question you want to answer through research",
                    "placeholder": "e.g., Why are users abandoning the checkout process? How can we improve the onboarding experience?",
                    "required": true
                },
                {
                    "name": "timeline",
                    "type": "text",
                    "label": "Project Timeline",
                    "description": "When does the research need to be completed?",
                    "placeholder": "e.g., 2 weeks, 1 month, Next sprint",
                    "required": true
                },
                {
                    "name": "budget",
                    "type": "text",
                    "label": "Budget",
                    "description": "Available budget for the research",
                    "placeholder": "e.g., $1,000, $5,000, Limited budget",
                    "required": true
                },
                {
                    "name": "target_users",
                    "type": "textarea",
                    "label": "Target Users",
                    "description": "Who you want to research with",
                    "placeholder": "e.g., Existing customers, Potential users, Power users, Novice users",
                    "required": true
                },
                {
                    "name": "product_stage",
                    "type": "text",
                    "label": "Current Stage",
                    "description": "Current stage of product development",
                    "placeholder": "e.g., Discovery, Design, Development, Post-launch",
                    "required": true
                }
            ]),
            "tags": "ux,research,product-development,user-experience",
            "visibility": "public"
        },
        {
            "title": "Sales Script Generator",
            "short_description": "Create effective sales scripts for different stages of the sales process.",
            "long_description": "Develop persuasive sales scripts that guide conversations with prospects at different stages of the sales cycle. This prompt helps you create structured dialogues that address common objections and highlight key benefits.",
            "template": "Create a sales script for:\n\n**Product/Service:** {{product_name}}\n**Sales Stage:** {{sales_stage}}\n**Target Audience:** {{target_audience}}\n**Key Benefits:** {{key_benefits}}\n**Common Objections:** {{objections}}\n**Call to Action:** {{call_to_action}}\n\nPlease include:\n\n1. **Opening**: How to begin the conversation\n2. **Discovery Questions**: Questions to understand prospect needs\n3. **Value Proposition**: How to present your solution\n4. **Key Differentiators**: What sets you apart from competitors\n5. **Objection Handling**: Responses to common objections\n6. **Social Proof**: How to incorporate testimonials or case studies\n7. **Closing**: How to move to the next step\n8. **Follow-up**: What to do after the conversation\n9. **Alternative Approaches**: Different tactics for different prospect personalities\n10. **Success Metrics**: How to measure script effectiveness\n\nMake the script conversational, authentic, and focused on solving the prospect's problems.",
            "inputs": JSON.stringify([
                {
                    "name": "product_name",
                    "type": "text",
                    "label": "Product/Service",
                    "description": "What you're selling",
                    "placeholder": "e.g., CRM software, Digital marketing services, Financial planning",
                    "required": true
                },
                {
                    "name": "sales_stage",
                    "type": "text",
                    "label": "Sales Stage",
                    "description": "Stage of the sales process this script is for",
                    "placeholder": "e.g., Cold call, Initial meeting, Product demo, Follow-up, Closing",
                    "required": true
                },
                {
                    "name": "target_audience",
                    "type": "text",
                    "label": "Target Audience",
                    "description": "Who you're selling to",
                    "placeholder": "e.g., Small business owners, HR managers, IT directors, Marketing executives",
                    "required": true
                },
                {
                    "name": "key_benefits",
                    "type": "textarea",
                    "label": "Key Benefits",
                    "description": "Main benefits of your product/service",
                    "placeholder": "e.g., Saves time, Reduces costs, Increases efficiency, Improves customer satisfaction",
                    "required": true
                },
                {
                    "name": "objections",
                    "type": "textarea",
                    "label": "Common Objections",
                    "description": "Typical objections you hear from prospects",
                    "placeholder": "e.g., Too expensive, Already have a solution, Not the right time, Need to check with team",
                    "required": true
                },
                {
                    "name": "call_to_action",
                    "type": "text",
                    "label": "Call to Action",
                    "description": "What you want the prospect to do next",
                    "placeholder": "e.g., Schedule a demo, Sign up for free trial, Purchase now, Book a consultation",
                    "required": true
                }
            ]),
            "tags": "sales,script,customer-acquisition,business-development",
            "visibility": "public"
        },
        {
            title: 'Code Review Assistant',
            short_description: 'Get comprehensive code reviews with specific feedback and suggestions for improvement.',
            long_description: 'This prompt helps developers get detailed code reviews by providing structured analysis of code quality, potential bugs, performance issues, and best practices. Perfect for teams looking to maintain high code standards.',
            template: 'You are an expert code reviewer. Please review the following {{language}} code and provide detailed feedback on:\n\n1. Code quality and readability\n2. Potential bugs or issues\n3. Performance considerations\n4. Best practices and suggestions for improvement\n\nCode to review:\n```{{language}}\n{{code}}\n```\n\nPlease provide specific, actionable feedback.',
            inputs: JSON.stringify([
                {
                    name: 'language',
                    type: 'text',
                    label: 'Programming Language',
                    description: 'The programming language of the code',
                    placeholder: 'e.g., JavaScript, Python, Java',
                    required: true
                },
                {
                    name: 'code',
                    type: 'textarea',
                    label: 'Code to Review',
                    description: 'The code you want reviewed',
                    placeholder: 'Paste your code here...',
                    required: true
                }
            ]),
            tags: 'code,review,development,programming',
            visibility: 'public'
        },
        {
            title: 'Creative Writing Prompt Generator',
            short_description: 'Generate engaging creative writing prompts for any genre or theme.',
            long_description: 'Perfect for writers experiencing creative blocks or looking for inspiration. This prompt generates unique, thought-provoking creative writing ideas tailored to your preferred genre and themes.',
            template: 'Generate 3 unique and engaging creative writing prompts for {{genre}} stories. Each prompt should:\n\n- Be specific enough to spark immediate ideas\n- Include interesting character dynamics\n- Have potential for conflict or tension\n- Incorporate the theme: {{theme}}\n\nTarget audience: {{audience}}\nStory length: {{length}}\n\nMake each prompt distinctive and inspiring.',
            inputs: JSON.stringify([
                {
                    name: 'genre',
                    type: 'text',
                    label: 'Genre',
                    description: 'The genre of story you want to write',
                    placeholder: 'e.g., fantasy, sci-fi, mystery, romance',
                    required: true
                },
                {
                    name: 'theme',
                    type: 'text',
                    label: 'Theme',
                    description: 'The central theme or concept',
                    placeholder: 'e.g., redemption, friendship, betrayal',
                    required: true
                },
                {
                    name: 'audience',
                    type: 'text',
                    label: 'Target Audience',
                    description: 'Who will read this story',
                    placeholder: 'e.g., young adult, adult, children',
                    required: false
                },
                {
                    name: 'length',
                    type: 'text',
                    label: 'Story Length',
                    description: 'Approximate length of the story',
                    placeholder: 'e.g., short story, novella, novel',
                    required: false
                }
            ]),
            tags: 'creative,writing,inspiration,storytelling',
            visibility: 'public'
        },
        {
            title: 'Marketing Copy Optimizer',
            short_description: 'Transform basic product descriptions into compelling marketing copy that converts.',
            long_description: 'Turn bland product descriptions into persuasive marketing copy that drives sales. This prompt helps create compelling headlines, benefit-focused descriptions, and clear calls-to-action.',
            template: 'Transform this product description into compelling marketing copy:\n\nProduct: {{product_name}}\nDescription: {{description}}\nTarget audience: {{audience}}\nKey benefit: {{benefit}}\n\nCreate:\n1. A compelling headline\n2. 3-4 bullet points highlighting key benefits\n3. A persuasive paragraph focusing on the main value proposition\n4. A strong call-to-action\n\nMake it conversion-focused and audience-appropriate.',
            inputs: JSON.stringify([
                {
                    name: 'product_name',
                    type: 'text',
                    label: 'Product Name',
                    description: 'The name of your product',
                    placeholder: 'e.g., Quantum Bluetooth Headphones',
                    required: true
                },
                {
                    name: 'description',
                    type: 'textarea',
                    label: 'Current Description',
                    description: 'Your existing product description',
                    placeholder: 'Current description of your product...',
                    required: true
                },
                {
                    name: 'audience',
                    type: 'text',
                    label: 'Target Audience',
                    description: 'Who is your target customer',
                    placeholder: 'e.g., tech-savvy professionals, fitness enthusiasts',
                    required: true
                },
                {
                    name: 'benefit',
                    type: 'text',
                    label: 'Key Benefit',
                    description: 'The main benefit or value proposition',
                    placeholder: 'e.g., superior sound quality, time-saving',
                    required: true
                }
            ]),
            tags: 'marketing,copywriting,sales,business',
            visibility: 'public'
        },
        {
            title: 'Technical Documentation Writer',
            short_description: 'Create clear, comprehensive technical documentation for any software feature or API.',
            long_description: 'Generate professional technical documentation that makes complex features easy to understand. Perfect for developers who need to document APIs, features, or technical processes.',
            template: 'Create comprehensive technical documentation for:\n\n**Feature/API:** {{feature_name}}\n**Type:** {{doc_type}}\n**Audience:** {{audience}}\n\nGenerate:\n\n1. **Overview**: Brief description of what it does\n2. **Prerequisites**: What users need before starting\n3. **Step-by-step instructions**: Clear, actionable steps\n4. **Code examples**: Practical examples (if applicable)\n5. **Common issues**: Potential problems and solutions\n6. **Additional resources**: Related documentation or links\n\nAdditional context: {{context}}\n\nMake it clear, concise, and user-friendly.',
            inputs: JSON.stringify([
                {
                    name: 'feature_name',
                    type: 'text',
                    label: 'Feature/API Name',
                    description: 'What are you documenting?',
                    placeholder: 'e.g., User Authentication API, Payment Integration',
                    required: true
                },
                {
                    name: 'doc_type',
                    type: 'text',
                    label: 'Documentation Type',
                    description: 'Type of documentation needed',
                    placeholder: 'e.g., API reference, user guide, tutorial',
                    required: true
                },
                {
                    name: 'audience',
                    type: 'text',
                    label: 'Target Audience',
                    description: 'Who will use this documentation?',
                    placeholder: 'e.g., developers, end users, system admins',
                    required: true
                },
                {
                    name: 'context',
                    type: 'textarea',
                    label: 'Additional Context',
                    description: 'Any specific details or requirements',
                    placeholder: 'Special considerations, technical constraints, etc.',
                    required: false
                }
            ]),
            tags: 'documentation,technical,writing,development',
            visibility: 'public'
        },
        {
            title: 'Social Media Content Planner',
            short_description: 'Generate a week\'s worth of engaging social media posts for any business or brand.',
            long_description: 'Create a comprehensive social media content calendar with varied post types designed to engage your audience and promote your brand effectively across different platforms.',
            template: 'Create a 7-day social media content plan for:\n\n**Business:** {{business_name}}\n**Industry:** {{industry}}\n**Target audience:** {{audience}}\n**Main platforms:** {{platforms}}\n**Key message/goal:** {{goal}}\n\nFor each day, provide:\n- Post type (educational, promotional, behind-the-scenes, user-generated, etc.)\n- Caption with relevant hashtags\n- Visual suggestion\n- Best posting time\n- Engagement strategy\n\nFocus on {{content_focus}} and maintain a {{brand_voice}} tone.',
            inputs: JSON.stringify([
                {
                    name: 'business_name',
                    type: 'text',
                    label: 'Business Name',
                    description: 'Name of the business or brand',
                    placeholder: 'e.g., TechStart Solutions, Cozy Café',
                    required: true
                },
                {
                    name: 'industry',
                    type: 'text',
                    label: 'Industry',
                    description: 'What industry/sector is the business in',
                    placeholder: 'e.g., technology, food & beverage, fitness',
                    required: true
                },
                {
                    name: 'audience',
                    type: 'text',
                    label: 'Target Audience',
                    description: 'Who is your target audience',
                    placeholder: 'e.g., small business owners, millennials, tech professionals',
                    required: true
                },
                {
                    name: 'platforms',
                    type: 'text',
                    label: 'Social Platforms',
                    description: 'Which platforms will you use',
                    placeholder: 'e.g., Instagram, LinkedIn, Twitter',
                    required: true
                },
                {
                    name: 'goal',
                    type: 'text',
                    label: 'Primary Goal',
                    description: 'Main objective for this content',
                    placeholder: 'e.g., increase brand awareness, drive sales, build community',
                    required: true
                },
                {
                    name: 'content_focus',
                    type: 'text',
                    label: 'Content Focus',
                    description: 'What should the content emphasize',
                    placeholder: 'e.g., product features, company culture, industry insights',
                    required: false
                },
                {
                    name: 'brand_voice',
                    type: 'text',
                    label: 'Brand Voice',
                    description: 'Tone and personality of the brand',
                    placeholder: 'e.g., professional, friendly, humorous, inspiring',
                    required: false
                }
            ]),
            tags: 'social-media,marketing,content,planning',
            visibility: 'public'
        },
        {
            title: 'Learning Path Creator',
            short_description: 'Design a comprehensive learning path for mastering any new skill or topic.',
            long_description: 'Create structured, progressive learning plans that take someone from beginner to proficient in any subject. Perfect for self-directed learners and educators.',
            template: 'Create a comprehensive learning path for mastering: **{{skill}}**\n\n**Learner profile:**\n- Current level: {{current_level}}\n- Target level: {{target_level}}\n- Available time: {{time_commitment}}\n- Learning style: {{learning_style}}\n\n**Please provide:**\n\n1. **Learning Objectives**: 5-6 specific, measurable goals\n2. **Phased Approach**: 3-4 progressive phases\n3. **Resources**: Books, courses, tutorials, practice projects\n4. **Timeline**: Realistic schedule for each phase\n5. **Milestones**: How to measure progress\n6. **Practice Projects**: Hands-on projects to reinforce learning\n\nMake it practical and actionable.',
            inputs: JSON.stringify([
                {
                    name: 'skill',
                    type: 'text',
                    label: 'Skill/Topic',
                    description: 'What skill do you want to learn?',
                    placeholder: 'e.g., Python programming, digital marketing, guitar',
                    required: true
                },
                {
                    name: 'current_level',
                    type: 'text',
                    label: 'Current Level',
                    description: 'Current knowledge/experience level',
                    placeholder: 'e.g., complete beginner, some basics, intermediate',
                    required: true
                },
                {
                    name: 'target_level',
                    type: 'text',
                    label: 'Target Level',
                    description: 'Desired proficiency level',
                    placeholder: 'e.g., job-ready, advanced hobbyist, expert',
                    required: true
                },
                {
                    name: 'time_commitment',
                    type: 'text',
                    label: 'Time Commitment',
                    description: 'How much time can you dedicate?',
                    placeholder: 'e.g., 1 hour daily, 10 hours weekly, weekends only',
                    required: true
                },
                {
                    name: 'learning_style',
                    type: 'text',
                    label: 'Learning Style',
                    description: 'Preferred way of learning',
                    placeholder: 'e.g., hands-on projects, video tutorials, reading',
                    required: false
                }
            ]),
            tags: 'education,learning,skills,development',
            visibility: 'public'
        },
        {
            title: 'Problem-Solution Framework',
            short_description: 'Analyze complex problems and generate structured, actionable solutions.',
            long_description: 'Break down complex challenges into manageable components and develop comprehensive solution strategies. Great for business problems, personal challenges, or project planning.',
            template: 'Analyze this problem and provide structured solutions:\n\n**Problem:** {{problem_description}}\n**Context:** {{context}}\n**Constraints:** {{constraints}}\n**Stakeholders:** {{stakeholders}}\n\n**Analysis Framework:**\n\n1. **Problem Breakdown**: Identify root causes and contributing factors\n2. **Impact Assessment**: Who/what is affected and how\n3. **Solution Options**: 3-4 different approaches with pros/cons\n4. **Recommended Solution**: Best option with detailed implementation\n5. **Success Metrics**: How to measure if the solution works\n6. **Risk Mitigation**: Potential challenges and how to address them\n7. **Timeline**: Realistic implementation schedule\n\nBe specific and actionable.',
            inputs: JSON.stringify([
                {
                    name: 'problem_description',
                    type: 'textarea',
                    label: 'Problem Description',
                    description: 'Clearly describe the problem or challenge',
                    placeholder: 'What specific problem are you trying to solve?',
                    required: true
                },
                {
                    name: 'context',
                    type: 'textarea',
                    label: 'Context & Background',
                    description: 'Relevant background information',
                    placeholder: 'Company size, industry, timeline, etc.',
                    required: true
                },
                {
                    name: 'constraints',
                    type: 'text',
                    label: 'Constraints',
                    description: 'Budget, time, resource limitations',
                    placeholder: 'e.g., limited budget, 3-month deadline, small team',
                    required: false
                },
                {
                    name: 'stakeholders',
                    type: 'text',
                    label: 'Key Stakeholders',
                    description: 'Who is involved or affected?',
                    placeholder: 'e.g., customers, employees, management, partners',
                    required: true
                }
            ]),
            tags: 'problem-solving,analysis,strategy,business',
            visibility: 'public'
        },
        {
            "title": "Strategic Business Plan Developer",
            "short_description": "Generate a comprehensive, data-informed strategic business plan for internal or external stakeholders.",
            "long_description": "This advanced prompt guides the creation of a full-fledged strategic business plan. It moves beyond a simple summary to include detailed market analysis, organizational structure, financial projections, and a strategic roadmap. Ideal for entrepreneurs seeking funding, business units planning for the next fiscal year, or managers proposing new ventures.",
            "template": "You are an expert business strategist and management consultant. Your task is to develop a comprehensive strategic business plan based on the provided information. The plan must be detailed, professional, and persuasive, suitable for presentation to executive leadership, investors, or key stakeholders.\n\n**Business Context:**\n- **Business Name:** {{business_name}}\n- **Mission Statement:** {{mission_statement}}\n- **Industry:** {{industry}}\n- **Business Model:** {{business_model}} (e.g., B2B SaaS, D2C E-commerce, Marketplace)\n- **Primary Target Market:** {{target_market}}\n- **Key Products/Services:** {{key_products_services}}\n- **Sustainable Competitive Advantage:** {{competitive_advantage}}\n- **Current Team Summary:** {{team_summary}}\n- **Funding Stage/Context:** {{funding_stage}} (e.g., Bootstrapped, Seed, Series A, Internal Budget)\n- **Strategic Time Horizon:** {{time_horizon}} (e.g., 1 year, 3 years, 5 years)\n\n**Generate the following sections with exceptional detail and clarity:**\n\n1.  **Executive Summary:** A concise, powerful overview of the entire plan. Write this last, but place it first. It must summarize the mission, product/service, market opportunity, competitive advantage, team, and financial highlights.\n\n2.  **Company Description:** Expand on the mission. Detail the company's history, vision, core values, and legal structure. Explain the problem the business solves and for whom.\n\n3.  **Market Analysis:** Provide a deep dive into the industry.\n    - **Industry Outlook:** Current size, growth rate, and trends.\n    - **Target Market Analysis:** Define the ideal customer persona(s) in detail. Include Total Addressable Market (TAM), Serviceable Available Market (SAM), and Serviceable Obtainable Market (SOM) estimates.\n    - **Competitive Analysis:** Identify 3-5 key competitors. For each, analyze their strengths, weaknesses, market share, and pricing. Create a competitive matrix that visually positions our business against them.\n\n4.  **Organization & Management:** Outline the organizational structure. Detail the management team, their roles, responsibilities, and relevant experience. Identify any key gaps in the team and a plan to fill them.\n\n5.  **Products & Services:** Describe the offerings in detail. Explain the product lifecycle, current R&D activities, and future product pipeline. Discuss intellectual property (e.g., patents, trademarks).\n\n6.  **Marketing & Sales Strategy:**\n    - **Positioning:** How do we want the brand to be perceived?\n    - **Pricing Strategy:** Detail the pricing model and justification.\n    - **Promotion Strategy:** Outline the marketing channels (e.g., content marketing, SEO, paid ads, partnerships) and budget allocation.\n    - **Sales Strategy:** Describe the sales process, team structure, and key performance indicators (KPIs).\n\n7.  **Financial Projections:** Provide a 3-5 year forecast.\n    - **Key Assumptions:** Clearly list all assumptions driving the projections.\n    - **Projected Profit and Loss:** Year-by-year breakdown.\n    - **Projected Cash Flow Statement:** Year-by-year breakdown.\n    - **Projected Balance Sheet:** Year-by-year breakdown.\n    - **Break-Even Analysis:** Calculate and explain the break-even point.\n    - **Funding Request (if applicable):** Specify the amount needed, its use, and the proposed terms.\n\n8.  **Strategic Roadmap & Implementation Plan:**\n    - **Key Strategic Objectives:** List 3-5 high-level objectives for the time horizon.\n    - **Milestones & Timeline:** Create a timeline of key milestones for the first 1-2 years.\n    - **Key Performance Indicators (KPIs):** Define the metrics that will be used to measure success.\n    - **Potential Ris & Mitigation:** Identify major risks (market, operational, financial) and strategies to mitigate them.\n\nEnsure the final output is a cohesive, logically structured document that tells a compelling story about the business's potential for success.",
            "inputs": JSON.stringify([
                { "name": "business_name", "type": "text", "label": "Business Name", "description": "The official name of the business or project.", "placeholder": "e.g., InnovateSphere Analytics", "required": true },
                { "name": "mission_statement", "type": "textarea", "label": "Mission Statement", "description": "The core purpose and focus of the business.", "placeholder": "e.g., To empower small businesses with actionable data insights.", "required": true },
                { "name": "industry", "type": "text", "label": "Industry", "description": "The primary industry sector.", "placeholder": "e.g., B2B SaaS, Renewable Energy, E-commerce", "required": true },
                { "name": "business_model", "type": "text", "label": "Business Model", "description": "How the company creates, delivers, and captures value.", "placeholder": "e.g., B2B SaaS (Subscription), D2C E-commerce, Freemium", "required": true },
                { "name": "target_market", "type": "textarea", "label": "Primary Target Market", "description": "A detailed description of the ideal customer.", "placeholder": "e.g., Small to medium-sized retail businesses in North America with 50-250 employees.", "required": true },
                { "name": "key_products_services", "type": "textarea", "label": "Key Products/Services", "description": "The main offerings the business provides.", "placeholder": "e.g., A cloud-based dashboard for sales analytics, API for data integration, Custom reporting modules.", "required": true },
                { "name": "competitive_advantage", "type": "textarea", "label": "Sustainable Competitive Advantage", "description": "What makes the business unique and hard to copy.", "placeholder": "e.g., Proprietary AI algorithm, exclusive partnerships, first-mover advantage in a niche.", "required": true },
                { "name": "team_summary", "type": "textarea", "label": "Current Team Summary", "description": "Brief bios of key team members and their expertise.", "placeholder": "e.g., CEO with 15 years in retail tech, CTO with AI background from Google, Head of Sales from a leading SaaS company.", "required": true },
                { "name": "funding_stage", "type": "text", "label": "Funding Stage/Context", "description": "The current financial state or purpose of the plan.", "placeholder": "e.g., Seeking Series A, Internal budget approval, Bootstrapped and profitable.", "required": true },
                { "name": "time_horizon", "type": "text", "label": "Strategic Time Horizon", "description": "The period this plan covers.", "placeholder": "e.g., 1 Year, 3 Years, 5 Years", "required": true }
            ]),
            "tags": "business-plan,strategy,management,finance,entrepreneurship",
            "visibility": "public"
        },
        {
            "title": "Complex Project Deconstruction & Roadmap Generator",
            "short_description": "Break down large, ambiguous business objectives into detailed, actionable project plans with phases, tasks, and dependencies.",
            "long_description": "This prompt is designed for project managers, team leads, and strategists to transform high-level, complex goals into a structured project plan. It utilizes project management principles to define scope, create a work breakdown structure (WBS), allocate resources, identify risks, and establish a clear roadmap for execution.",
            "template": "You are an expert PMP-certified project manager. Your task is to take a high-level, complex business objective and deconstruct it into a comprehensive, actionable project plan. The plan must be logical, realistic, and detailed enough to guide a team from initiation to completion.\n\n**Project Context:**\n- **Primary Project Goal:** {{project_goal}}\n- **Definition of Success / Key Performance Indicators (KPIs):** {{success_metrics}}\n- **Available Resources (Team, Tools):** {{available_resources}}\n- **Key Stakeholders:** {{key_stakeholders}}\n- **Budget Constraints:** {{budget_constraints}}\n- **Hard Deadline / Target Completion Date:** {{deadline}}\n- **Known Dependencies or Prerequisites:** {{known_dependencies}}\n- **Potential Risks or Concerns:** {{potential_risks}}\n\n**Generate the following project plan components:**\n\n1.  **Project Charter & Scope Definition:**\n    - **Project Vision & Objectives:** Reiterate the goal in a formal vision statement.\n    - **In-Scope Items:** A detailed, bulleted list of what this project will deliver.\n    - **Out-of-Scope Items:** A clear, bulleted list of related items that this project will *not* address to prevent scope creep.\n    - **High-Level Assumptions and Constraints:** List the core assumptions and the constraints (budget, timeline, resources) you must operate within.\n\n2.  **Work Breakdown Structure (WBS):**\n    - **Project Phases:** Break the entire project into 3-5 logical, sequential phases (e.g., Phase 1: Discovery & Planning, Phase 2: Development & Implementation, Phase 3: Testing & Launch, Phase 4: Post-Launch Support).\n    - **Detailed Tasks:** For each phase, list all the specific, actionable tasks required to complete it. Each task should start with a strong verb (e.g., Design, Develop, Test, Document, Review).\n    - **Deliverables per Task:** For each task, specify the tangible output or deliverable.\n\n3.  **Timeline & Milestone Schedule:**\n    - **Task Durations:** Assign a realistic time estimate (in hours or days) to each task.\n    - **Task Dependencies:** Identify the dependencies between tasks (e.g., Task B cannot start until Task A is finished). Use a simple format like `Task B -> depends on -> Task A`.\n    - **Key Milestones:** Define 3-5 major milestones that mark significant achievements in the project. Assign a target date to each milestone.\n    - **Visual Timeline (Gantt Chart-style):** Create a text-based representation of the project schedule, showing phases, tasks, and durations over time.\n\n4.  **Resource Allocation Plan:**\n    - **Team Roles & Responsibilities:** Assign roles (e.g., Project Lead, Developer, Designer, QA Analyst) and map them to the specific tasks. Create a Responsibility Assignment Matrix (RACI) if applicable.\n    - **Budget Allocation:** Break down the total budget by major categories (e.g., Personnel, Software Licenses, Marketing, Contingency).\n\n5.  **Risk Management & Mitigation Plan:**\n    - **Risk Register:** Create a table identifying the top 5-7 potential risks. For each risk, assess its Probability (High/Medium/Low) and Impact (High/Medium/Low).\n    - **Mitigation Strategies:** For each high-priority risk, propose a specific strategy to reduce its likelihood or impact.\n    - **Contingency Plan:** Outline a backup plan for the most critical risks.\n\n6.  **Communication & Reporting Plan:**\n    - **Stakeholder Communication:** Detail how and when you will communicate with each stakeholder group (e.g., weekly email updates, bi-weekly status meetings, monthly steering committee presentations).\n    - **Reporting Cadence:** Specify the frequency and format of project status reports.\n\nThe final output should be a single, cohesive document that serves as a definitive guide for executing the project successfully.",
            "inputs": JSON.stringify([
                { "name": "project_goal", "type": "textarea", "label": "Primary Project Goal", "description": "The high-level objective you want to achieve.", "placeholder": "e.g., Increase customer retention by 15% in the next 6 months. Launch a new mobile app for our e-commerce platform.", "required": true },
                { "name": "success_metrics", "type": "textarea", "label": "Definition of Success / KPIs", "description": "How will you measure if the project was a success?", "placeholder": "e.g., Reduce churn rate from 5% to 4.25%, Achieve 10,000 app downloads in the first month.", "required": true },
                { "name": "available_resources", "type": "textarea", "label": "Available Resources", "description": "The team, tools, and other resources at your disposal.", "placeholder": "e.g., 2 developers, 1 designer, 1 PM, Jira/Asana, Figma, AWS credits.", "required": true },
                { "name": "key_stakeholders", "type": "textarea", "label": "Key Stakeholders", "description": "Individuals or groups who have an interest in the project's outcome.", "placeholder": "e.g., Head of Product, VP of Engineering, Marketing Director, Customer Support Team.", "required": true },
                { "name": "budget_constraints", "type": "text", "label": "Budget Constraints", "description": "The total budget available for the project.", "placeholder": "e.g., $50,000, Internal operational budget only, Needs approval for additional spend.", "required": true },
                { "name": "deadline", "type": "text", "label": "Hard Deadline", "description": "The final date by which the project must be completed.", "placeholder": "e.g., December 31, 2024, End of Q3, Before the annual conference.", "required": true },
                { "name": "known_dependencies", "type": "textarea", "label": "Known Dependencies", "description": "Any external or internal factors this project relies on.", "placeholder": "e.g., Requires API from another team, Depends on Q2 financial data, Must wait for legal approval.", "required": false },
                { "name": "potential_risks", "type": "textarea", "label": "Potential Risks or Concerns", "description": "Any known issues or challenges that could impact the project.", "placeholder": "e.g., Team member availability, potential scope creep, third-party vendor reliability.", "required": false }
            ]),
            "tags": "project-management,planning,roadmap,wbs,strategy",
            "visibility": "public"
        },
        {
            "title": "Comprehensive Root Cause Analysis (RCA) Facilitator",
            "short_description": "Systematically analyze complex incidents to identify root causes and prevent recurrence using formal RCA frameworks.",
            "long_description": "This prompt guides a user through a formal Root Cause Analysis process for a significant incident, failure, or problem. It facilitates the use of structured methodologies like the '5 Whys' and 'Fishbone Diagram' to move beyond symptoms and uncover the true underlying causes, culminating in a robust Corrective and Preventive Action Plan (CAPA).",
            "template": "You are an expert in quality assurance, process engineering, and root cause analysis methodologies. Your task is to facilitate a comprehensive RCA for a given incident. You will guide the process systematically to ensure a thorough, unbiased, and actionable report that prevents recurrence.\n\n**Incident Context:**\n- **Incident Title/Identifier:** {{incident_title}}\n- **Date and Time of Incident:** {{date_time_of_incident}}\n- **Detailed Description of the Incident:** {{incident_description}}\n- **Business/Operational Impact:** {{incident_impact}} (e.g., downtime, financial loss, customer impact, safety risk)\n- **Immediate Containment Actions Taken:** {{immediate_actions_taken}}\n- **Affected Systems, Processes, or Departments:** {{affected_systems_processes}}\n- **Available Data & Evidence:** {{data_available}} (e.g., logs, reports, user feedback)\n- **RCA Team Members:** {{team_members_involved}}\n\n**Generate the following RCA Report:**\n\n1.  **Executive Summary:** A brief, high-level overview of the incident, its impact, the identified root cause(s), and the key recommendations from the CAPA.\n\n2.  **Problem Statement & Timeline:**\n    - **Formal Problem Statement:** A single, clear sentence that defines the problem, its magnitude, its location, and its timing.\n    - **Sequence of Events:** Create a detailed, chronological timeline of events leading up to, during, and immediately following the incident. Use timestamps where possible.\n\n3.  **Analysis Methodology:**\n    - **5 Whys Analysis:** Starting from the direct incident symptom, ask 'Why?' five times (or as many times as needed) to drill down to a root cause. Document each step of the questioning and the corresponding answer.\n    - **Fishbone (Ishikawa) Diagram Analysis:** Brainstorm potential contributing causes across the following categories. For each category, list specific factors that may have contributed to the incident.\n        - **Manpower (People):** Skills, training, staffing, communication.\n        - **Methods (Processes):** Procedures, policies, workflow, regulations.\n        - **Machines (Equipment):** Tools, hardware, software, maintenance.\n        - **Materials (Resources):** Raw materials, information, data quality.\n        - **Measurement (Metrics):** KPIs, inspections, data collection methods.\n        - **Mother Nature (Environment):** External factors, workplace conditions, culture.\n\n4.  **Root Cause Conclusion:** Synthesize the findings from the 5 Whys and Fishbone analysis. Clearly state the primary root cause(s) and any significant contributing factors. Distinguish between root causes and symptoms.\n\n5.  **Corrective and Preventive Action Plan (CAPA):** For each identified root cause and major contributing factor, create a table with the following columns:\n    - **Identified Cause:** The specific cause being addressed.\n    - **Corrective Action (Immediate Fix):** What will be done to fix the immediate problem and restore normal operations.\n    - **Preventive Action (Long-Term Fix):** What will be done to ensure this root cause (and similar causes) cannot lead to a recurrence. This should focus on systemic changes.\n    - **Owner/Responsible Party:** The individual or team responsible for implementing the action.\n    - **Due Date:** The target date for completion.\n    - **Verification of Effectiveness:** How will we confirm that the action was successful and prevented recurrence?\n\nThe final report must be objective, evidence-based, and focused on systemic improvement rather than assigning individual blame.",
            "inputs": JSON.stringify([
                { "name": "incident_title", "type": "text", "label": "Incident Title/Identifier", "description": "A short, descriptive name for the incident.", "placeholder": "e.g., Production Database Outage, Q3 Financial Report Delay, Critical Software Bug in v2.1", "required": true },
                { "name": "date_time_of_incident", "type": "text", "label": "Date and Time of Incident", "description": "When the incident occurred.", "placeholder": "e.g., October 26, 2023, at approximately 14:30 PST.", "required": true },
                { "name": "incident_description", "type": "textarea", "label": "Detailed Description of the Incident", "description": "A factual, detailed account of what happened.", "placeholder": "e.g., The primary PostgreSQL database became unresponsive, causing all customer-facing services to fail with a 500 error.", "required": true },
                { "name": "incident_impact", "type": "textarea", "label": "Business/Operational Impact", "description": "The consequences of the incident.", "placeholder": "e.g., 3 hours of complete service outage, estimated $25k in lost revenue, 500+ customer support tickets.", "required": true },
                { "name": "immediate_actions_taken", "type": "textarea", "label": "Immediate Containment Actions Taken", "description": "What was done immediately to stop the problem.", "placeholder": "e.g., Failed over to standby database, rebooted primary server, communicated status to users.", "required": true },
                { "name": "affected_systems_processes", "type": "textarea", "label": "Affected Systems, Processes, or Departments", "description": "What was impacted by the incident.", "placeholder": "e.g., Customer-facing web app, internal reporting dashboard, sales team, customer support.", "required": true },
                { "name": "data_available", "type": "textarea", "label": "Available Data & Evidence", "description": "Logs, metrics, screenshots, or other evidence available for analysis.", "placeholder": "e.g., Application logs from Datadog, database error logs, network traffic data, user reports from Zendesk.", "required": true },
                { "name": "team_members_involved", "type": "textarea", "label": "RCA Team Members", "description": "The people involved in or affected by the incident and the RCA.", "placeholder": "e.g., Site Reliability Engineer, Database Administrator, Head of Engineering, Product Manager.", "required": true }
            ]),
            "tags": "root-cause-analysis,rca,incident-report,quality-assurance,process-improvement",
            "visibility": "public"
        }
    ]
};

async function seed() {
    try {
        console.log('🌱 Starting database seed...');

        // Sync database
        await sequelize.sync({ force: false });
        console.log('✅ Database synced');

        // Check if demo user already exists
        const existingUser = await User.findOne({ where: { email: seedData.user.email } });

        let demoUser;
        if (existingUser) {
            console.log('👤 Demo user already exists, using existing user');
            demoUser = existingUser;
        } else {
            // Create demo user
            const hashedPassword = await bcrypt.hash(seedData.user.password, 10);
            demoUser = await User.create({
                email: seedData.user.email,
                username: seedData.user.username,
                hashed_password: hashedPassword
            });
            console.log(`✅ Created demo user: ${demoUser.email}`);
        }

        // Check if prompts already exist
        // const existingPrompts = await PromptTemplate.count();
        // if (existingPrompts > 0) {
        //   console.log('📝 Prompts already exist in database');
        //   console.log(`   Found ${existingPrompts} existing prompts`);
        //   return;
        // }

        // Create sample prompts
        console.log('🚀 Creating sample prompts...');
        for (const promptData of seedData.prompts) {
            const prompt = await PromptTemplate.create({
                ...promptData,
                creator_id: demoUser.id
            });
            console.log(`   ✅ Created: "${prompt.title}"`);
        }

        console.log(`\n🎉 Seed completed successfully!`);
        console.log(`\n📋 Demo Account Details:`);
        console.log(`   Email: ${seedData.user.email}`);
        console.log(`   Password: ${seedData.user.password}`);
        console.log(`   Username: ${seedData.user.username}`);
        console.log(`\n📊 Created ${seedData.prompts.length} sample prompts\n`);

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seed().then(() => {
        console.log('✨ Seed script completed');
        process.exit(0);
    });
}

module.exports = { seed, seedData };