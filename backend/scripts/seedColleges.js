'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const College = require('../src/models/College');
const connectDB = require('../src/config/db');

const colleges = [
  // Maharashtra
  { name: 'Veermata Jijabai Technological Institute', domain: 'vjti.ac.in', city: 'Mumbai' },
  { name: 'IIT Bombay', domain: 'iitb.ac.in', city: 'Mumbai' },
  { name: 'Sardar Patel Institute of Technology', domain: 'spit.ac.in', city: 'Mumbai' },
  { name: 'K.J. Somaiya College of Engineering', domain: 'somaiya.edu', city: 'Mumbai' },
  { name: 'Thadomal Shahani Engineering College', domain: 'tsec.edu', city: 'Mumbai' },
  { name: 'Fr. Conceicao Rodrigues College of Engineering', domain: 'frcrce.ac.in', city: 'Mumbai' },
  { name: 'Dwarkadas J. Sanghvi College of Engineering', domain: 'djsce.ac.in', city: 'Mumbai' },
  { name: 'Vidyalankar Institute of Technology', domain: 'vit.edu.in', city: 'Mumbai' },
  { name: 'Shah & Anchor Kutchhi Engineering College', domain: 'sakec.ac.in', city: 'Mumbai' },
  { name: 'Mukesh Patel School of Technology Management & Engineering', domain: 'nmims.edu', city: 'Mumbai' },
  { name: 'Atharva College of Engineering', domain: 'atharvacoe.edu.in', city: 'Mumbai' },
  { name: 'Xavier Institute of Engineering', domain: 'xavier.ac.in', city: 'Mumbai' },
  { name: "Vivekanand Education Society's Institute of Technology", domain: 'vesit.edu', city: 'Mumbai' },
  { name: 'Rajiv Gandhi Institute of Technology', domain: 'rgiit.com', city: 'Mumbai' },
  { name: 'Lokmanya Tilak College of Engineering', domain: 'ltce.in', city: 'Navi Mumbai' },
  { name: 'Pillai College of Engineering', domain: 'pce.ac.in', city: 'Navi Mumbai' },
  { name: 'Terna Engineering College', domain: 'ternaengg.ac.in', city: 'Navi Mumbai' },
  { name: 'Bharati Vidyapeeth College of Engineering', domain: 'bvcoenm.edu.in', city: 'Navi Mumbai' },
  { name: "Vidyavardhini's College of Engineering and Technology", domain: 'vcet.edu.in', city: 'Vasai' },
  { name: 'Yadavrao Tasgaonkar Institute of Engineering', domain: 'ytiet.org', city: 'Karjat' },
  { name: 'College of Engineering Pune', domain: 'coep.ac.in', city: 'Pune' },
  { name: 'Pune Institute of Computer Technology', domain: 'pict.edu', city: 'Pune' },
  { name: 'Vishwakarma Institute of Technology', domain: 'vit.edu', city: 'Pune' },
  { name: 'Maharashtra Institute of Technology', domain: 'mitpune.edu.in', city: 'Pune' },
  { name: 'Symbiosis Institute of Technology', domain: 'sitpune.edu.in', city: 'Pune' },
  { name: 'Cummins College of Engineering', domain: 'cumminscollege.in', city: 'Pune' },
  { name: 'Sinhgad College of Engineering', domain: 'sinhgad.edu', city: 'Pune' },
  { name: 'Government College of Engineering Aurangabad', domain: 'geca.ac.in', city: 'Aurangabad' },
  { name: 'Walchand College of Engineering', domain: 'walchandsangli.ac.in', city: 'Sangli' },
  { name: 'Shri Guru Gobind Singhji Institute of Engineering', domain: 'sggs.ac.in', city: 'Nanded' },
  { name: 'Government Polytechnic Mumbai', domain: 'gpmumbai.ac.in', city: 'Mumbai' },

  // Delhi / NCR
  { name: 'IIT Delhi', domain: 'iitd.ac.in', city: 'Delhi' },
  { name: 'Delhi Technological University', domain: 'dtu.ac.in', city: 'Delhi' },
  { name: 'Netaji Subhas University of Technology', domain: 'nsut.ac.in', city: 'Delhi' },
  { name: 'Indraprastha Institute of Information Technology', domain: 'iiitd.ac.in', city: 'Delhi' },
  { name: 'Jamia Millia Islamia', domain: 'jmi.ac.in', city: 'Delhi' },
  { name: 'Guru Gobind Singh Indraprastha University', domain: 'ipu.ac.in', city: 'Delhi' },
  { name: 'Amity University', domain: 'amity.edu', city: 'Noida' },
  { name: 'Jaypee Institute of Information Technology', domain: 'jiit.ac.in', city: 'Noida' },

  // Karnataka
  { name: 'IIT Dharwad', domain: 'iitdh.ac.in', city: 'Dharwad' },
  { name: 'RV College of Engineering', domain: 'rvce.edu.in', city: 'Bangalore' },
  { name: 'BMS College of Engineering', domain: 'bmsce.ac.in', city: 'Bangalore' },
  { name: 'PES University', domain: 'pes.edu', city: 'Bangalore' },
  { name: 'Manipal Institute of Technology', domain: 'manipal.edu', city: 'Manipal' },
  { name: 'National Institute of Technology Karnataka', domain: 'nitk.ac.in', city: 'Surathkal' },
  { name: 'MS Ramaiah Institute of Technology', domain: 'msrit.edu', city: 'Bangalore' },
  { name: 'Dayananda Sagar College of Engineering', domain: 'dsce.edu.in', city: 'Bangalore' },

  // Tamil Nadu
  { name: 'IIT Madras', domain: 'iitm.ac.in', city: 'Chennai' },
  { name: 'Anna University', domain: 'annauniv.edu', city: 'Chennai' },
  { name: 'College of Engineering Guindy', domain: 'ceg.edu.in', city: 'Chennai' },
  { name: 'SSN College of Engineering', domain: 'ssn.edu.in', city: 'Chennai' },
  { name: 'SRM Institute of Science and Technology', domain: 'srmist.edu.in', city: 'Chennai' },
  { name: 'Vellore Institute of Technology', domain: 'vit.ac.in', city: 'Vellore' },
  { name: 'PSG College of Technology', domain: 'psgtech.ac.in', city: 'Coimbatore' },
  { name: 'Coimbatore Institute of Technology', domain: 'cit.edu.in', city: 'Coimbatore' },

  // Telangana / Andhra Pradesh
  { name: 'IIT Hyderabad', domain: 'iith.ac.in', city: 'Hyderabad' },
  { name: 'IIIT Hyderabad', domain: 'iiit.ac.in', city: 'Hyderabad' },
  { name: 'Osmania University College of Engineering', domain: 'osmania.ac.in', city: 'Hyderabad' },
  { name: 'BITS Pilani Hyderabad Campus', domain: 'hyderabad.bits-pilani.ac.in', city: 'Hyderabad' },
  { name: 'NIT Warangal', domain: 'nitw.ac.in', city: 'Warangal' },

  // West Bengal
  { name: 'IIT Kharagpur', domain: 'iitkgp.ac.in', city: 'Kharagpur' },
  { name: 'Jadavpur University', domain: 'jadavpur.edu', city: 'Kolkata' },
  { name: 'Bengal Engineering and Science University', domain: 'becs.ac.in', city: 'Howrah' },

  // Rajasthan
  { name: 'BITS Pilani', domain: 'pilani.bits-pilani.ac.in', city: 'Pilani' },
  { name: 'IIT Jodhpur', domain: 'iitj.ac.in', city: 'Jodhpur' },
  { name: 'MNIT Jaipur', domain: 'mnit.ac.in', city: 'Jaipur' },

  // Gujarat
  { name: 'IIT Gandhinagar', domain: 'iitgn.ac.in', city: 'Gandhinagar' },
  { name: 'Nirma University', domain: 'nirmauni.ac.in', city: 'Ahmedabad' },
  { name: 'Dhirubhai Ambani Institute of ICT', domain: 'daiict.ac.in', city: 'Gandhinagar' },
  { name: 'LD College of Engineering', domain: 'ldce.ac.in', city: 'Ahmedabad' },

  // Other IITs & NITs
  { name: 'IIT Kanpur', domain: 'iitk.ac.in', city: 'Kanpur' },
  { name: 'IIT Roorkee', domain: 'iitr.ac.in', city: 'Roorkee' },
  { name: 'IIT Guwahati', domain: 'iitg.ac.in', city: 'Guwahati' },
  { name: 'IIT Bhubaneswar', domain: 'iitbbs.ac.in', city: 'Bhubaneswar' },
  { name: 'NIT Trichy', domain: 'nitt.edu', city: 'Tiruchirappalli' },
  { name: 'NIT Calicut', domain: 'nitc.ac.in', city: 'Calicut' },
  { name: 'NIT Rourkela', domain: 'nitrkl.ac.in', city: 'Rourkela' },
];

async function seed() {
  await connectDB();

  console.log('\nSeeding colleges...\n');

  let inserted = 0;
  let skipped = 0;

  for (const college of colleges) {
    const exists = await College.findOne({ domain: college.domain });
    if (!exists) {
      await College.create(college);
      console.log(`  ✔  ${college.name} (${college.domain})`);
      inserted++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}  |  Already existed (skipped): ${skipped}\n`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
