const saveTabBtn = document.getElementById('saveTab');
const saveLeadBtn = document.getElementById('saveLead');
const leadsList = document.getElementById('leadsList');
const leadTextInput = document.getElementById('leadText');
const notesInput = document.getElementById('notes');
const searchInput = document.getElementById('searchLeads');

let leads = JSON.parse(localStorage.getItem('leads')) || [];
const deleteBtn = `<svg xmlns="http://www.w3.org/2000/svg" 
width="12" height="12" viewBox="0 0 24 24" fill="none" 
stroke="currentColor" stroke-width="2" stroke-linecap="round" 
stroke-linejoin="round" class="feather feather-trash-2"><polyline 
points="3 6 5 6 21 6">
</polyline><path d="M19 
6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 
0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
<line x1="10" y1="11" x2="10" y2="17"></line>
<line x1="14" y1="11" x2="14" y2="17"></line></svg>`;

const copyBtn = `<svg xmlns="http://www.w3.org/2000/svg" 
width="12" height="12" viewBox="0 0 24 24" fill="none" 
stroke="#0078d7" stroke-width="2" stroke-linecap="round"
stroke-linejoin="round" class="feather feather-copy"><rect x="9" y="9" 
width="13" height="13" rx="2" ry="2"></rect><path 
d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" 
viewBox="0 0 24 24" fill="none" stroke="green" stroke-width="2" 
stroke-linecap="round" stroke-linejoin="round" 
class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>`;


searchInput.addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  const filtered = leads.filter(l =>
    (l.title && l.title.toLowerCase().includes(query)) ||
    (l.text && l.text.toLowerCase().includes(query)) ||
    (l.notes && l.notes.toLowerCase().includes(query))
  );
  renderLeads(filtered);
});

function renderLeads(data = leads) {
  leadsList.innerHTML = '';

  if(!data.length) {
    leadsList.innerHTML = `
      <div class="empty-state">
        <p>No leads saved yet</p>
        <small>Save a tab or enter text to get started.</small>
      </div>
    `;
    return;
  }

  data.forEach((lead, index) => {
      const div = document.createElement('div');
    div.classList.add('lead-card');
    div.innerHTML = `
    <div class="lead-head">
    <p>
    <strong>${lead.title || 'Lead'}</strong>
    </p>
    <div class="action-btn-div">
    <button class="copyBtn" data-index="${index}">${copyBtn}</button>
    <button class="deleteBtn" data-index="${index}">${deleteBtn}</button>
    </div>
    </div>
    <div class="lead-text">
    ${lead.url ? `<a href="${lead.url}" target="_blank">${lead.url}</a><br>` : ''}
    <small>${lead.text || ''}</small><br>
    </div>
    `;
    leadsList.appendChild(div);
  });

  document.querySelectorAll('.deleteBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = e.currentTarget.dataset.index;
      leads.splice(i, 1);
      localStorage.setItem('leads', JSON.stringify(leads));
      renderLeads();
    });
  });
  document.querySelectorAll('.copyBtn').forEach(btn => {
    btn.addEventListener('click', e => {
      const index = e.currentTarget.dataset.index;
      const lead = leads[index];
      if(!lead) return;
      const textToCopy = lead.url 
      ? `${lead.url}`
      : `${lead.text || ''}`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        btn.innerHTML = checkIcon;
        setTimeout(() => (btn.innerHTML = copyBtn), 1500);
      }) .catch(err => console.error('failed to copy: ', err));
    })
  })
}


// ✅ Works properly with Manifest V3
saveTabBtn.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return alert('Could not get active tab.');
    const newLead = {
      title: tab.title,
      url: tab.url,
      text: '',
      notes: ''
    };
    leads.push(newLead);
    localStorage.setItem('leads', JSON.stringify(leads));
    renderLeads();
  } catch (err) {
    console.error('Error saving tab:', err);
  }
});

saveLeadBtn.addEventListener('click', () => {
  const text = leadTextInput.value.trim();
  const notes = notesInput.value.trim();
  if (!text) return alert('Please enter lead text or info');
  const newLead = { title: notes, url: '', text };
  leads.push(newLead);
  localStorage.setItem('leads', JSON.stringify(leads));
  renderLeads();
  leadTextInput.value = '';
  notesInput.value = '';
});



renderLeads();
