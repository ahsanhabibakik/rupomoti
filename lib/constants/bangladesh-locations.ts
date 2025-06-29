export interface District {
  id: string
  name: string
  upazilas: string[]
}

export interface Division {
  id: string
  name: string
  districts: District[]
}

export const bangladeshLocations: Division[] = [
  {
    id: 'dhaka',
    name: 'Dhaka',
    districts: [
      {
        id: 'dhaka',
        name: 'Dhaka',
        upazilas: [
          'Dhamrai', 'Dohar', 'Keraniganj', 'Nawabganj', 'Savar',
          'Tejgaon', 'Gulshan', 'Dhanmondi', 'Motijheel', 'Old Dhaka',
          'Wari', 'Ramna', 'Tejgaon Industrial', 'Pallabi', 'Mirpur',
          'Uttara', 'Shah Ali', 'Badda', 'Kafrul', 'Cantonment'
        ]
      },
      {
        id: 'faridpur',
        name: 'Faridpur',
        upazilas: [
          'Faridpur Sadar', 'Alfadanga', 'Bhanga', 'Boalmari',
          'Charbhadrasan', 'Madhukhali', 'Nagarkanda', 'Sadarpur', 'Saltha'
        ]
      },
      {
        id: 'gazipur',
        name: 'Gazipur',
        upazilas: [
          'Gazipur Sadar', 'Kaliakair', 'Kapasia', 'Sreepur', 'Kaliganj'
        ]
      },
      {
        id: 'gopalganj',
        name: 'Gopalganj',
        upazilas: [
          'Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Muksudpur', 'Tungipara'
        ]
      },
      {
        id: 'kishoreganj',
        name: 'Kishoreganj',
        upazilas: [
          'Kishoreganj Sadar', 'Austagram', 'Bajitpur', 'Bhairab',
          'Hossainpur', 'Itna', 'Karimganj', 'Katiadi', 'Kuliarchar',
          'Mithamain', 'Nikli', 'Pakundia', 'Tarail'
        ]
      },
      {
        id: 'madaripur',
        name: 'Madaripur',
        upazilas: [
          'Madaripur Sadar', 'Kalkini', 'Rajoir', 'Shibchar'
        ]
      },
      {
        id: 'manikganj',
        name: 'Manikganj',
        upazilas: [
          'Manikganj Sadar', 'Daulatpur', 'Ghior', 'Harirampur',
          'Saturia', 'Shivalaya', 'Singair'
        ]
      },
      {
        id: 'munshiganj',
        name: 'Munshiganj',
        upazilas: [
          'Munshiganj Sadar', 'Gazaria', 'Lohajang', 'Sirajdikhan',
          'Sreenagar', 'Tongibari'
        ]
      },
      {
        id: 'narayanganj',
        name: 'Narayanganj',
        upazilas: [
          'Narayanganj Sadar', 'Araihazar', 'Bandar', 'Rupganj', 'Sonargaon'
        ]
      },
      {
        id: 'narsingdi',
        name: 'Narsingdi',
        upazilas: [
          'Narsingdi Sadar', 'Belabo', 'Monohardi', 'Palash',
          'Raipura', 'Shibpur'
        ]
      },
      {
        id: 'rajbari',
        name: 'Rajbari',
        upazilas: [
          'Rajbari Sadar', 'Baliakandi', 'Goalandaghat', 'Pangsha', 'Kalukhali'
        ]
      },
      {
        id: 'shariatpur',
        name: 'Shariatpur',
        upazilas: [
          'Shariatpur Sadar', 'Bhedarganj', 'Damudya', 'Gosairhat',
          'Naria', 'Zajira'
        ]
      },
      {
        id: 'tangail',
        name: 'Tangail',
        upazilas: [
          'Tangail Sadar', 'Basail', 'Bhuapur', 'Delduar', 'Ghatail',
          'Gopalpur', 'Kalihati', 'Madhupur', 'Mirzapur', 'Nagarpur',
          'Sakhipur', 'Dhanbari'
        ]
      }
    ]
  },
  {
    id: 'chittagong',
    name: 'Chittagong',
    districts: [
      {
        id: 'chittagong',
        name: 'Chittagong',
        upazilas: [
          'Chittagong Sadar', 'Anwara', 'Banshkhali', 'Boalkhali',
          'Chandanaish', 'Fatikchhari', 'Hathazari', 'Lohagara',
          'Mirsharai', 'Patiya', 'Rangunia', 'Raozan', 'Sandwip',
          'Satkania', 'Sitakunda'
        ]
      },
      {
        id: 'bandarban',
        name: 'Bandarban',
        upazilas: [
          'Bandarban Sadar', 'Alikadam', 'Lama', 'Naikhongchhari',
          'Rowangchhari', 'Ruma', 'Thanchi'
        ]
      },
      {
        id: 'brahmanbaria',
        name: 'Brahmanbaria',
        upazilas: [
          'Brahmanbaria Sadar', 'Akhaura', 'Ashuganj', 'Bancharampur',
          'Bijoynagar', 'Kasba', 'Nabinagar', 'Nasirnagar', 'Sarail'
        ]
      },
      {
        id: 'chandpur',
        name: 'Chandpur',
        upazilas: [
          'Chandpur Sadar', 'Faridganj', 'Haimchar', 'Haziganj',
          'Kachua', 'Matlab Dakshin', 'Matlab Uttar', 'Shahrasti'
        ]
      },
      {
        id: 'comilla',
        name: 'Comilla',
        upazilas: [
          'Comilla Sadar', 'Barura', 'Brahmanpara', 'Burichang',
          'Chandina', 'Chauddagram', 'Daudkandi', 'Debidwar',
          'Homna', 'Laksam', 'Meghna', 'Muradnagar', 'Nangalkot',
          'Titas', 'Monohorgonj', 'Sadar Dakshin'
        ]
      },
      {
        id: 'coxsbazar',
        name: "Cox's Bazar",
        upazilas: [
          "Cox's Bazar Sadar", 'Chakaria', 'Kutubdia', 'Maheshkhali',
          'Ramu', 'Teknaf', 'Ukhiya', 'Pekua'
        ]
      },
      {
        id: 'feni',
        name: 'Feni',
        upazilas: [
          'Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Fulgazi',
          'Parshuram', 'Sonagazi'
        ]
      },
      {
        id: 'khagrachhari',
        name: 'Khagrachhari',
        upazilas: [
          'Khagrachhari Sadar', 'Dighinala', 'Lakshmichhari',
          'Mahalchhari', 'Manikchhari', 'Matiranga', 'Panchhari',
          'Ramgarh'
        ]
      },
      {
        id: 'lakshmipur',
        name: 'Lakshmipur',
        upazilas: [
          'Lakshmipur Sadar', 'Kamalnagar', 'Raipur', 'Ramganj', 'Ramgati'
        ]
      },
      {
        id: 'noakhali',
        name: 'Noakhali',
        upazilas: [
          'Noakhali Sadar', 'Begumganj', 'Chatkhil', 'Companiganj',
          'Hatiya', 'Kabirhat', 'Senbagh', 'Sonaimuri', 'Subarnachar'
        ]
      },
      {
        id: 'rangamati',
        name: 'Rangamati',
        upazilas: [
          'Rangamati Sadar', 'Baghaichhari', 'Barkal', 'Juraichhari',
          'Kaptai', 'Kawkhali', 'Langadu', 'Nannerchar', 'Rajasthali', 'Belaichhari'
        ]
      }
    ]
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi',
    districts: [
      {
        id: 'rajshahi',
        name: 'Rajshahi',
        upazilas: [
          'Rajshahi Sadar', 'Bagha', 'Bagmara', 'Charghat', 'Durgapur',
          'Godagari', 'Mohanpur', 'Paba', 'Puthia', 'Tanore'
        ]
      },
      {
        id: 'bogra',
        name: 'Bogra',
        upazilas: [
          'Bogra Sadar', 'Adamdighi', 'Dhunat', 'Dhupchanchia',
          'Gabtali', 'Kahaloo', 'Nandigram', 'Sariakandi',
          'Shajahanpur', 'Sherpur', 'Shibganj', 'Sonatola'
        ]
      },
      {
        id: 'chapainawabganj',
        name: 'Chapai Nawabganj',
        upazilas: [
          'Chapai Nawabganj Sadar', 'Bholahat', 'Gomastapur',
          'Nachole', 'Shibganj'
        ]
      },
      {
        id: 'joypurhat',
        name: 'Joypurhat',
        upazilas: [
          'Joypurhat Sadar', 'Akkelpur', 'Kalai', 'Khetlal', 'Panchbibi'
        ]
      },
      {
        id: 'naogaon',
        name: 'Naogaon',
        upazilas: [
          'Naogaon Sadar', 'Atrai', 'Badalgachhi', 'Dhamoirhat',
          'Manda', 'Mahadebpur', 'Niamatpur', 'Patnitala',
          'Porsha', 'Raninagar', 'Sapahar'
        ]
      },
      {
        id: 'natore',
        name: 'Natore',
        upazilas: [
          'Natore Sadar', 'Bagatipara', 'Baraigram', 'Gurudaspur',
          'Lalpur', 'Singra'
        ]
      },
      {
        id: 'pabna',
        name: 'Pabna',
        upazilas: [
          'Pabna Sadar', 'Atgharia', 'Bera', 'Bhangura', 'Chatmohar',
          'Faridpur', 'Ishwardi', 'Santhia', 'Sujanagar'
        ]
      },
      {
        id: 'sirajganj',
        name: 'Sirajganj',
        upazilas: [
          'Sirajganj Sadar', 'Belkuchi', 'Chauhali', 'Kamarkhand',
          'Kazipur', 'Raiganj', 'Shahjadpur', 'Tarash', 'Ullahpara'
        ]
      }
    ]
  },
  {
    id: 'khulna',
    name: 'Khulna',
    districts: [
      {
        id: 'khulna',
        name: 'Khulna',
        upazilas: [
          'Khulna Sadar', 'Batiaghata', 'Dacope', 'Dumuria', 'Dighalia',
          'Koyra', 'Paikgachha', 'Phultala', 'Rupsa', 'Terokhada'
        ]
      },
      {
        id: 'bagerhat',
        name: 'Bagerhat',
        upazilas: [
          'Bagerhat Sadar', 'Chitalmari', 'Fakirhat', 'Kachua',
          'Mollahat', 'Mongla', 'Morrelganj', 'Rampal', 'Sarankhola'
        ]
      },
      {
        id: 'chuadanga',
        name: 'Chuadanga',
        upazilas: [
          'Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'
        ]
      },
      {
        id: 'jessore',
        name: 'Jessore',
        upazilas: [
          'Jessore Sadar', 'Abhaynagar', 'Bagherpara', 'Chaugachha',
          'Jhikargachha', 'Keshabpur', 'Manirampur', 'Sharsha'
        ]
      },
      {
        id: 'jhenaidah',
        name: 'Jhenaidah',
        upazilas: [
          'Jhenaidah Sadar', 'Harinakunda', 'Kaliganj', 'Kotchandpur',
          'Maheshpur', 'Shailkupa'
        ]
      },
      {
        id: 'kushtia',
        name: 'Kushtia',
        upazilas: [
          'Kushtia Sadar', 'Bheramara', 'Daulatpur', 'Khoksa',
          'Kumarkhali', 'Mirpur'
        ]
      },
      {
        id: 'magura',
        name: 'Magura',
        upazilas: [
          'Magura Sadar', 'Mohammadpur', 'Shalikha', 'Sreepur'
        ]
      },
      {
        id: 'meherpur',
        name: 'Meherpur',
        upazilas: [
          'Meherpur Sadar', 'Gangni', 'Mujibnagar'
        ]
      },
      {
        id: 'narail',
        name: 'Narail',
        upazilas: [
          'Narail Sadar', 'Kalia', 'Lohagara'
        ]
      },
      {
        id: 'satkhira',
        name: 'Satkhira',
        upazilas: [
          'Satkhira Sadar', 'Assasuni', 'Debhata', 'Kalaroa',
          'Kaliganj', 'Shyamnagar', 'Tala'
        ]
      }
    ]
  },
  {
    id: 'barisal',
    name: 'Barisal',
    districts: [
      {
        id: 'barisal',
        name: 'Barisal',
        upazilas: [
          'Barisal Sadar', 'Agailjhara', 'Babuganj', 'Bakerganj',
          'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj',
          'Muladi', 'Wazirpur'
        ]
      },
      {
        id: 'barguna',
        name: 'Barguna',
        upazilas: [
          'Barguna Sadar', 'Amtali', 'Bamna', 'Betagi', 'Patharghata', 'Taltali'
        ]
      },
      {
        id: 'bhola',
        name: 'Bhola',
        upazilas: [
          'Bhola Sadar', 'Burhanuddin', 'Char Fasson', 'Daulatkhan',
          'Lalmohan', 'Manpura', 'Tazumuddin'
        ]
      },
      {
        id: 'jhalokati',
        name: 'Jhalokati',
        upazilas: [
          'Jhalokati Sadar', 'Kathalia', 'Nalchity', 'Rajapur'
        ]
      },
      {
        id: 'patuakhali',
        name: 'Patuakhali',
        upazilas: [
          'Patuakhali Sadar', 'Bauphal', 'Dashmina', 'Dumki',
          'Galachipa', 'Kalapara', 'Mirzaganj', 'Rangabali'
        ]
      },
      {
        id: 'pirojpur',
        name: 'Pirojpur',
        upazilas: [
          'Pirojpur Sadar', 'Bhandaria', 'Kawkhali', 'Mathbaria',
          'Nazirpur', 'Nesarabad', 'Zianagar'
        ]
      }
    ]
  },
  {
    id: 'sylhet',
    name: 'Sylhet',
    districts: [
      {
        id: 'sylhet',
        name: 'Sylhet',
        upazilas: [
          'Sylhet Sadar', 'Beanibazar', 'Bishwanath', 'Companiganj',
          'Fenchuganj', 'Golapganj', 'Gowainghat', 'Jaintiapur',
          'Kanaighat', 'Osmani Nagar', 'Zakiganj', 'Dakshin Surma'
        ]
      },
      {
        id: 'habiganj',
        name: 'Habiganj',
        upazilas: [
          'Habiganj Sadar', 'Ajmiriganj', 'Bahubal', 'Baniyachong',
          'Chunarughat', 'Lakhai', 'Madhabpur', 'Nabiganj', 'Sayestaganj'
        ]
      },
      {
        id: 'moulvibazar',
        name: 'Moulvibazar',
        upazilas: [
          'Moulvibazar Sadar', 'Barlekha', 'Juri', 'Kamalganj',
          'Kulaura', 'Rajnagar', 'Sreemangal'
        ]
      },
      {
        id: 'sunamganj',
        name: 'Sunamganj',
        upazilas: [
          'Sunamganj Sadar', 'Bishwamvarpur', 'Chhatak', 'Derai',
          'Dharamapasha', 'Dowarabazar', 'Jagannathpur', 'Jamalganj',
          'Sullah', 'Tahirpur'
        ]
      }
    ]
  },
  {
    id: 'rangpur',
    name: 'Rangpur',
    districts: [
      {
        id: 'rangpur',
        name: 'Rangpur',
        upazilas: [
          'Rangpur Sadar', 'Badarganj', 'Gangachara', 'Kaunia',
          'Mithapukur', 'Pirgachha', 'Pirganj', 'Taraganj'
        ]
      },
      {
        id: 'dinajpur',
        name: 'Dinajpur',
        upazilas: [
          'Dinajpur Sadar', 'Birampur', 'Birganj', 'Biral', 'Bochaganj',
          'Chirirbandar', 'Fulbari', 'Ghoraghat', 'Hakimpur',
          'Kaharole', 'Khansama', 'Nawabganj', 'Parbatipur'
        ]
      },
      {
        id: 'gaibandha',
        name: 'Gaibandha',
        upazilas: [
          'Gaibandha Sadar', 'Fulchhari', 'Gobindaganj', 'Palashbari',
          'Sadullapur', 'Saghata', 'Sundarganj'
        ]
      },
      {
        id: 'kurigram',
        name: 'Kurigram',
        upazilas: [
          'Kurigram Sadar', 'Bhurungamari', 'Char Rajibpur',
          'Chilmari', 'Phulbari', 'Nageshwari', 'Rajarhat',
          'Raomari', 'Ulipur'
        ]
      },
      {
        id: 'lalmonirhat',
        name: 'Lalmonirhat',
        upazilas: [
          'Lalmonirhat Sadar', 'Aditmari', 'Hatibandha', 'Kaliganj', 'Patgram'
        ]
      },
      {
        id: 'nilphamari',
        name: 'Nilphamari',
        upazilas: [
          'Nilphamari Sadar', 'Dimla', 'Domar', 'Jaldhaka',
          'Kishoreganj', 'Sayedpur'
        ]
      },
      {
        id: 'panchagarh',
        name: 'Panchagarh',
        upazilas: [
          'Panchagarh Sadar', 'Atwari', 'Boda', 'Debiganj', 'Tetulia'
        ]
      },
      {
        id: 'thakurgaon',
        name: 'Thakurgaon',
        upazilas: [
          'Thakurgaon Sadar', 'Baliadangi', 'Haripur', 'Pirganj', 'Ranisankail'
        ]
      }
    ]
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh',
    districts: [
      {
        id: 'mymensingh',
        name: 'Mymensingh',
        upazilas: [
          'Mymensingh Sadar', 'Bhaluka', 'Dhobaura', 'Fulbaria',
          'Gaffargaon', 'Gauripur', 'Haluaghat', 'Ishwarganj',
          'Muktagachha', 'Nandail', 'Phulpur', 'Trishal'
        ]
      },
      {
        id: 'jamalpur',
        name: 'Jamalpur',
        upazilas: [
          'Jamalpur Sadar', 'Baksiganj', 'Dewanganj', 'Islampur',
          'Madarganj', 'Melandaha', 'Sarishabari'
        ]
      },
      {
        id: 'netrokona',
        name: 'Netrokona',
        upazilas: [
          'Netrokona Sadar', 'Atpara', 'Barhatta', 'Durgapur',
          'Kalmakanda', 'Kendua', 'Khaliajuri', 'Madan', 'Mohanganj', 'Purbadhala'
        ]
      },
      {
        id: 'sherpur',
        name: 'Sherpur',
        upazilas: [
          'Sherpur Sadar', 'Jhenaigati', 'Nakla', 'Nalitabari', 'Sreebardi'
        ]
      }
    ]
  }
]

// Helper functions
export const getAllDistricts = (): District[] => {
  return bangladeshLocations.flatMap(division => division.districts)
}

export const getDistrictsByDivision = (divisionId: string): District[] => {
  const division = bangladeshLocations.find(d => d.id === divisionId)
  return division ? division.districts : []
}

export const getUpazilasByDistrict = (districtId: string): string[] => {
  const district = getAllDistricts().find(d => d.id === districtId)
  return district ? district.upazilas : []
}

export const searchLocation = (query: string): { divisions: Division[], districts: District[], upazilas: string[] } => {
  const lowerQuery = query.toLowerCase()
  
  const matchingDivisions = bangladeshLocations.filter(division => 
    division.name.toLowerCase().includes(lowerQuery)
  )
  
  const matchingDistricts = getAllDistricts().filter(district => 
    district.name.toLowerCase().includes(lowerQuery)
  )
  
  const matchingUpazilas: string[] = []
  bangladeshLocations.forEach(division => {
    division.districts.forEach(district => {
      district.upazilas.forEach(upazila => {
        if (upazila.toLowerCase().includes(lowerQuery)) {
          matchingUpazilas.push(upazila)
        }
      })
    })
  })
  
  return {
    divisions: matchingDivisions,
    districts: matchingDistricts,
    upazilas: [...new Set(matchingUpazilas)] // Remove duplicates
  }
}
