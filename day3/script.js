// Starting data provided by the assignment
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// 1. searchNotes(word)
function searchNotes(word) {
  const lowerWord = word.toLowerCase();
  return notes.filter(note => note.text.toLowerCase().includes(lowerWord));
}

// 2. longestNote()
function longestNote() {
  if (notes.length === 0) return null;
  
  let longest = notes[0];
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i];
    }
  }
  return longest;
}

// 3. countByCategory()
function countByCategory() {
  let counts = {};
  for (let i = 0; i < notes.length; i++) {
    let cat = notes[i].category;
    if (counts[cat]) {
      counts[cat]++;
    } else {
      counts[cat] = 1;
    }
  }
  return counts;
}

// 4. getSummary()
function getSummary() {
  const counts = countByCategory();
  const totalNotes = notes.length;
  
  // Pluralization helpers
  const totalText = totalNotes === 1 ? "1 note" : `${totalNotes} notes`;
  const personalCount = counts.personal || 0;
  const workCount = counts.work || 0;
  const studyCount = counts.study || 0;

  const personalText = personalCount === 1 ? "1 personal" : `${personalCount} personal`;
  const workText = workCount === 1 ? "1 work" : `${workCount} work`;
  const studyText = studyCount === 1 ? "1 study" : `${studyCount} study`;

  return `${totalText}: ${personalText}, ${workText}, ${studyText}.`;
}

// 5. isDuplicate(text)
function isDuplicate(text) {
  const cleanedText = text.trim().toLowerCase();
  return notes.some(note => note.text.trim().toLowerCase() === cleanedText);
}

// 6. addNote(text, category)
function addNote(text, category) {
  // Rule 1: Length check
  if (!text || text.length < 1 || text.length > 200) {
    console.log("Failed to add note: Text length must be between 1 and 200 characters.");
    return false;
  }

  // Rule 2: Category check
  const allowedCategories = ["personal", "work", "study"];
  if (!allowedCategories.includes(category)) {
    console.log("Failed to add note: Invalid category. Must be personal, work, or study.");
    return false;
  }

  // Rule 3: Duplicate check
  if (isDuplicate(text)) {
    console.log("Failed to add note: A duplicate note already exists.");
    return false;
  }

  // If all rules pass, create and add the note
  const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  notes.push({ id: newId, text: text, category: category });
  return true;
}


// ==========================================
// TEST CASES (Check your browser console!)
// ==========================================

console.log("--- Testing searchNotes ---");
console.log(searchNotes("day 3")); // Expected: [{ id: 2, text: "Finish the Day 3 assignment", category: "study" }]
console.log(searchNotes("pizza")); // Expected: [] (Edge case: no match)

console.log("--- Testing longestNote ---");
console.log(longestNote()); // Expected: { id: 3, text: "Email the project report to Grace", category: "work" }
// Edge case test for empty array
let savedNotes = notes; 
notes = []; 
console.log(longestNote()); // Expected: null
notes = savedNotes; // Restore array

console.log("--- Testing countByCategory ---");
console.log(countByCategory()); // Expected: { personal: 2, study: 2, work: 1 }

console.log("--- Testing getSummary ---");
console.log(getSummary()); // Expected: "5 notes: 2 personal, 1 work, 2 study."

console.log("--- Testing isDuplicate ---");
console.log(isDuplicate("  call mum  ")); // Expected: true (Edge case: ignores extra spaces and casing)
console.log(isDuplicate("Buy groceries")); // Expected: false

console.log("--- Testing addNote ---");
console.log(addNote("Learn Git basics", "study")); // Expected: true
console.log(addNote("Buy milk and bread", "personal")); // Expected: false (Edge case: duplicate error logged)
console.log(addNote("Code", "leisure")); // Expected: false (Edge case: invalid category error logged)
