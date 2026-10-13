const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Company = require('./models/Company');
const Lead = require('./models/Lead');
const Task = require('./models/Task');
const connectDB = require('./config/db');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany();
    await Company.deleteMany();
    await Lead.deleteMany();
    await Task.deleteMany();

    console.log('Seeding Users...');
    // Seed Users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@crm.com',
        password: 'password123',
        role: 'Sales Rep',
      },
      {
        name: 'Sarah Smith',
        email: 'sarah@crm.com',
        password: 'password123',
        role: 'Sales Rep',
      },
      {
        name: 'Admin User',
        email: 'admin@crm.com',
        password: 'password123',
        role: 'Admin',
      },
    ]);

    const john = users[0];
    const sarah = users[1];
    const admin = users[2];

    console.log('Seeding Companies...');
    // Seed Companies (Wireframe: ABC Corp | IT | Chennai)
    const companies = await Company.create([
      {
        name: 'ABC Corp',
        industry: 'IT',
        location: 'Chennai',
        website: 'https://abccorp.example.com',
        phone: '+91 44 2828 0001',
        notes: 'Major IT enterprise client with active enterprise expansion',
        createdBy: admin._id,
      },
      {
        name: 'TechNova Solutions',
        industry: 'Cloud Software',
        location: 'Bangalore',
        website: 'https://technova.example.com',
        phone: '+91 80 4112 3456',
        notes: 'High-growth SaaS provider looking for CRM integration',
        createdBy: admin._id,
      },
      {
        name: 'Apex FinServe',
        industry: 'Financial Services',
        location: 'Mumbai',
        website: 'https://apexfin.example.com',
        phone: '+91 22 6677 8899',
        notes: 'Financial advisory and asset management firm',
        createdBy: admin._id,
      },
      {
        name: 'GreenLogistics Inc',
        industry: 'Logistics & Supply Chain',
        location: 'Hyderabad',
        website: 'https://greenlogistics.example.com',
        phone: '+91 40 2345 6789',
        notes: 'Cold chain and warehouse logistics partner',
        createdBy: admin._id,
      },
    ]);

    const [abcCorp, techNova, apexFin, greenLogistics] = companies;

    console.log('Seeding Leads...');
    // Seed Leads (Wireframe: Ravi | r@mail | New | John)
    const leads = await Lead.create([
      {
        name: 'Ravi',
        email: 'r@mail.com',
        phone: '+91 98765 43210',
        status: 'New',
        assignedTo: john._id,
        company: abcCorp._id,
        notes: 'Contacted through website inquiry form. Interested in CRM trial.',
      },
      {
        name: 'Ananya Sharma',
        email: 'ananya@technova.example.com',
        phone: '+91 98111 22334',
        status: 'Qualified',
        assignedTo: john._id,
        company: techNova._id,
        notes: 'Budget approved for Q1 enterprise tier.',
      },
      {
        name: 'Karthik Rao',
        email: 'karthik@apexfin.example.com',
        phone: '+91 98222 33445',
        status: 'Contacted',
        assignedTo: sarah._id,
        company: apexFin._id,
        notes: 'Had introductory call, scheduled demo for Friday.',
      },
      {
        name: 'Priya Sundaram',
        email: 'priya@abccorp.example.com',
        phone: '+91 98333 44556',
        status: 'Qualified',
        assignedTo: sarah._id,
        company: abcCorp._id,
        notes: 'Decision maker for IT infrastructure software.',
      },
      {
        name: 'Vikram Patel',
        email: 'vikram@greenlogistics.example.com',
        phone: '+91 98444 55667',
        status: 'Lost',
        assignedTo: john._id,
        company: greenLogistics._id,
        notes: 'Chose alternative vendor due to specific legacy ERP constraints.',
      },
      {
        name: 'Meera Iyer',
        email: 'meera@apexfin.example.com',
        phone: '+91 98555 66778',
        status: 'New',
        assignedTo: sarah._id,
        company: apexFin._id,
        notes: 'Requested product brochure and security compliance doc.',
      },
      {
        name: 'Arjun Das',
        email: 'arjun@technova.example.com',
        phone: '+91 98666 77889',
        status: 'Qualified',
        assignedTo: john._id,
        company: techNova._id,
        notes: 'Ready for contract signoff once procurement finishes review.',
      },
      // Soft-deleted lead to prove it does not appear in normal queries!
      {
        name: 'Archived Duplicate Lead',
        email: 'duplicate@test.com',
        phone: '+91 99999 99999',
        status: 'Lost',
        assignedTo: john._id,
        company: abcCorp._id,
        notes: 'Soft deleted duplicate lead',
        isDeleted: true,
        deletedAt: new Date(),
      },
    ]);

    const [leadRavi, leadAnanya, leadKarthik, leadPriya] = leads;

    console.log('Seeding Tasks...');
    // Seed Tasks (Wireframe: Call | Ravi | Today / Due Date | Pending | Done)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    await Task.create([
      {
        title: 'Call',
        description: 'Call Ravi regarding initial requirements and team size',
        lead: leadRavi._id,
        assignedTo: john._id,
        dueDate: today,
        status: 'Pending',
        createdBy: john._id,
      },
      {
        title: 'Send Proposal',
        description: 'Send enterprise tier pricing proposal to Ananya',
        lead: leadAnanya._id,
        assignedTo: john._id,
        dueDate: today,
        status: 'Pending',
        createdBy: john._id,
      },
      {
        title: 'Product Demo',
        description: 'Host product walkthrough session with engineering team',
        lead: leadKarthik._id,
        assignedTo: sarah._id,
        dueDate: tomorrow,
        status: 'In Progress',
        createdBy: sarah._id,
      },
      {
        title: 'Contract Review Follow-up',
        description: 'Follow up on MSA redlines sent last week',
        lead: leadPriya._id,
        assignedTo: sarah._id,
        dueDate: yesterday,
        status: 'Completed',
        createdBy: sarah._id,
      },
      {
        title: 'Initial Discovery Call',
        description: 'Completed onboarding discovery call',
        lead: leadRavi._id,
        assignedTo: john._id,
        dueDate: yesterday,
        status: 'Completed',
        createdBy: john._id,
      },
    ]);

    console.log('=============================================');
    console.log('Database successfully seeded!');
    console.log('Test credentials:');
    console.log('Sales Rep:  john@crm.com  /  password123');
    console.log('Sales Rep:  sarah@crm.com /  password123');
    console.log('Admin User: admin@crm.com /  password123');
    console.log('=============================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
