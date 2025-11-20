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
    const existingPrompts = await PromptTemplate.count();
    if (existingPrompts > 0) {
      console.log('📝 Prompts already exist in database');
      console.log(`   Found ${existingPrompts} existing prompts`);
      return;
    }

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