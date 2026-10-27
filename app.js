const STORAGE_KEY = "arvysEventsDataV1";
const icons = {Technology:"⌘",Business:"↗",Education:"▤",Music:"♫",Community:"♧",Other:"✦"};
const today = new Date();
const dateOffset = (days) => { const d = new Date(); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const sampleData = {
  events: [
    {id:"evt-1",name:"Tech Innovation Summit 2026",date:dateOffset(5),time:"10:00",location:"Port Harcourt, Nigeria",description:"A gathering of developers, founders, and technology enthusiasts exploring the next wave of innovation.",category:"Technology",capacity:150,createdAt:new Date().toISOString()},
    {id:"evt-2",name:"Business Growth & Networking",date:dateOffset(12),time:"13:30",location:"Lagos, Nigeria",description:"Connect with entrepreneurs and learn practical strategies for sustainable business growth.",category:"Business",capacity:100,createdAt:new Date().toISOString()},
    {id:"evt-3",name:"Creative Arts & Music Night",date:dateOffset(19),time:"17:00",location:"Abuja, Nigeria",description:"An evening celebrating emerging artists, live performances, and creative collaboration.",category:"Music",capacity:200,createdAt:new Date().toISOString()}
  ],
  attendees: [
    {id:"reg-1",eventId:"evt-1",name:"Amara Okafor",email:"amara@example.com",registeredAt:new Date().toISOString()},
    {id:"reg-2",eventId:"evt-1",name:"Daniel James",email:"daniel@example.com",registeredAt:new Date().toISOString()},
    {id:"reg-3",eventId:"evt-2",name:"Chidinma Eze",email:"chidinma@example.com",registeredAt:new Date().toISOString()},
    {id:"reg-4",eventId:"evt-3",name:"Tobi Williams",email:"tobi@example.com",registeredAt:new Date().toISOString()}
  ]
};
let data;
try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(sampleData); }
catch { data = JSON.parse(JSON.stringify(sampleData)); }
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escapeHTML = (value="") => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
const eventById = id => data.events.find(event => event.id === id);
const attendeesFor = id => data.attendees.filter(person => person.eventId === id);
const dateObj = date => new Date(`${date}T00:00:00`);
const prettyDate = date => dateObj(date).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
const prettyDateTime = (date,time) => `${prettyDate(date)} · ${time}`;
const eventStatus = event => {
  if (event.capacity - attendeesFor(event.id).length <= 0) return {label:"Full",className:"status-full"};
  const d = dateObj(event.date); d.setHours(23,59,59,999);
  if (d < new Date()) return {label:"Past",className:"status-past"};
  return {label:"Upcoming",className:"status-upcoming"};
};
const categoryClass = category => ({Technology:"thumb-tech",Business:"thumb-business",Music:"thumb-music",Community:"thumb-community",Education:"thumb-tech",Other:"thumb-community"}[category] || "thumb-tech");
const eventCell = event => `<div class="event-cell"><div class="event-thumb ${categoryClass(event.category)}">${icons[event.category] || "✦"}</div><div><strong>${escapeHTML(event.name)}</strong><small>${escapeHTML(event.category)}</small></div></div>`;
const showToast = (message, error=false) => {
  const toast=$("#toast"); toast.textContent=message; toast.classList.toggle("error",error); toast.classList.remove("hidden");
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.add("hidden"),3000);
};
function renderDashboard() {
  const registrations=data.attendees.length;
  const upcoming=data.events.filter(e=>dateObj(e.date)>=new Date(new Date().setHours(0,0,0,0))).length;
  const available=data.events.reduce((sum,e)=>sum+Math.max(0,Number(e.capacity)-attendeesFor(e.id).length),0);
  $("#totalEvents").textContent=data.events.length;
  $("#totalRegistrations").textContent=registrations;
  $("#upcomingEvents").textContent=upcoming;
  $("#availableSeats").textContent=available.toLocaleString();
  const sorted=[...data.events].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,5);
  $("#recentEventsBody").innerHTML=sorted.map(event=>{
    const status=eventStatus(event);
    return `<tr><td>${eventCell(event)}</td><td>${prettyDate(event.date)}</td><td><span class="registration-count">${attendeesFor(event.id).length}</span><span style="color:#a1a9b7"> / ${event.capacity}</span></td><td><span class="status ${status.className}">${status.label}</span></td><td><button class="small-action" data-edit="${event.id}" aria-label="Edit ${escapeHTML(event.name)}">Edit</button></td></tr>`;
  }).join("");
  $("#recentEmpty").classList.toggle("hidden",sorted.length>0);
  $("#recentEventsBody").closest(".table-wrap").classList.toggle("hidden",sorted.length===0);
}
function renderEvents() {
  const query=$("#eventSearch").value.trim().toLowerCase();
  const list=[...data.events].sort((a,b)=>a.date.localeCompare(b.date)).filter(e=>`${e.name} ${e.location} ${e.category}`.toLowerCase().includes(query));
  $("#eventCountLabel").textContent=`${list.length} event${list.length===1?"":"s"}`;
  $("#allEventsBody").innerHTML=list.map(event=>{
    const status=eventStatus(event);
    return `<tr><td>${eventCell(event)}</td><td>${prettyDateTime(event.date,event.time)}</td><td>${escapeHTML(event.location)}</td><td><span class="registration-count">${attendeesFor(event.id).length}</span><span style="color:#a1a9b7"> / ${event.capacity}</span></td><td><span class="status ${status.className}">${status.label}</span></td><td><div class="row-actions"><button class="small-action" data-edit="${event.id}">Edit</button><button class="small-action danger" data-delete="${event.id}">Delete</button><button class="small-action" data-register="${event.id}">Register</button></div></td></tr>`;
  }).join("");
  $("#eventsEmpty").classList.toggle("hidden",list.length>0);
  $("#allEventsBody").closest(".table-wrap").classList.toggle("hidden",list.length===0);
}
function renderAttendees() {
  const query=$("#attendeeSearch").value.trim().toLowerCase();
  const list=[...data.attendees].sort((a,b)=>b.registeredAt.localeCompare(a.registeredAt)).filter(person=>{
    const event=eventById(person.eventId);
    return `${person.name} ${person.email} ${event?.name||""}`.toLowerCase().includes(query);
  });
  $("#attendeeCountLabel").textContent=`${list.length} registration${list.length===1?"":"s"}`;
  $("#attendeesBody").innerHTML=list.map(person=>{
    const event=eventById(person.eventId);
    return `<tr><td><div class="event-cell"><div class="avatar">${escapeHTML(person.name.split(/\s+/).slice(0,2).map(s=>s[0]).join("").toUpperCase())}</div><div><strong>${escapeHTML(person.name)}</strong><small>Attendee</small></div></div></td><td>${escapeHTML(person.email)}</td><td>${escapeHTML(event?.name||"Event removed")}</td><td>${new Date(person.registeredAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</td><td><button class="small-action danger" data-remove-attendee="${person.id}">Remove</button></td></tr>`;
  }).join("");
  $("#attendeesEmpty").classList.toggle("hidden",list.length>0);
  $("#attendeesBody").closest(".table-wrap").classList.toggle("hidden",list.length===0);
}
function renderRegistrationOptions(selectedId="") {
  const availableEvents=data.events.filter(event=>attendeesFor(event.id).length<Number(event.capacity));
  $("#registrationEvent").innerHTML=availableEvents.length
    ? availableEvents.map(e=>`<option value="${e.id}" ${e.id===selectedId?"selected":""}>${escapeHTML(e.name)} — ${Math.max(0,e.capacity-attendeesFor(e.id).length)} seats left</option>`).join("")
    : `<option value="">No events with available seats</option>`;
  $("#registrationForm").querySelector('button[type="submit"]').disabled=availableEvents.length===0;
}
function renderAll() { renderDashboard(); renderEvents(); renderAttendees(); renderRegistrationOptions(); }
function openEventModal(id="") {
  const form=$("#eventForm"); form.reset(); $("#eventId").value="";
  $("#eventModalTitle").textContent=id?"Edit event":"Create a new event";
  $("#eventCapacity").value=100; $("#eventTime").value="10:00";
  $("#eventDate").min=dateOffset(0);
  if(id) {
    const e=eventById(id); if(!e)return;
    $("#eventId").value=e.id; $("#eventName").value=e.name; $("#eventDate").value=e.date;
    $("#eventTime").value=e.time; $("#eventLocation").value=e.location; $("#eventDescription").value=e.description||"";
    $("#eventCategory").value=e.category; $("#eventCapacity").value=e.capacity;
  } else $("#eventDate").value=dateOffset(1);
  $("#eventModal").classList.remove("hidden"); $("#eventName").focus();
}
function openRegistrationModal(eventId="") {
  renderRegistrationOptions(eventId); $("#registrationForm").reset(); renderRegistrationOptions(eventId);
  $("#registrationModal").classList.remove("hidden");
  if($("#registrationEvent").options.length) $("#attendeeName").focus();
}
function closeModal(id) { $("#"+id).classList.add("hidden"); }
function navigate(view) {
  const labels={dashboard:"Dashboard",events:"Events",attendees:"Attendees"};
  $$(".page-view").forEach(el=>el.classList.remove("active"));
  $("#"+view+"View").classList.add("active");
  $$(".nav-link").forEach(el=>el.classList.toggle("active",el.dataset.view===view));
  $("#breadcrumbCurrent").textContent=labels[view]||"Dashboard";
  $("#sidebar").classList.remove("open");
}
function deleteEvent(id) {
  const event=eventById(id); if(!event)return;
  if(!confirm(`Delete "${event.name}" and its registrations?`))return;
  data.events=data.events.filter(e=>e.id!==id);
  data.attendees=data.attendees.filter(a=>a.eventId!==id);
  save(); renderAll(); showToast("Event and related registrations deleted.");
}

document.addEventListener("click",e=>{
  const nav=e.target.closest("[data-view]");
  if(nav){navigate(nav.dataset.view);return;}
  const go=e.target.closest("[data-go]");
  if(go){navigate(go.dataset.go);return;}
  if(e.target.closest("[data-create]")||e.target.closest("#createEventTop")){openEventModal();return;}
  const edit=e.target.closest("[data-edit]");
  if(edit){openEventModal(edit.dataset.edit);return;}
  const del=e.target.closest("[data-delete]");
  if(del){deleteEvent(del.dataset.delete);return;}
  const register=e.target.closest("[data-register]");
  if(register){openRegistrationModal(register.dataset.register);return;}
  const remove=e.target.closest("[data-remove-attendee]");
  if(remove){
    const person=data.attendees.find(a=>a.id===remove.dataset.removeAttendee);
    if(person&&confirm(`Remove registration for ${person.name}?`)){data.attendees=data.attendees.filter(a=>a.id!==person.id);save();renderAll();showToast("Registration removed.");}
    return;
  }
  const close=e.target.closest("[data-close]");
  if(close){closeModal(close.dataset.close);return;}
  if(e.target.classList.contains("modal-backdrop"))closeModal(e.target.id);
});
$("#eventForm").addEventListener("submit",e=>{
  e.preventDefault();
  const id=$("#eventId").value;
  const capacity=Number($("#eventCapacity").value);
  const existing=id?eventById(id):null;
  if(!capacity||capacity<1){showToast("Capacity must be at least one.",true);return;}
  if(existing&&capacity<attendeesFor(id).length){showToast("Capacity cannot be lower than current registrations.",true);return;}
  const event={
    id:id||`evt-${Date.now()}`,name:$("#eventName").value.trim(),date:$("#eventDate").value,time:$("#eventTime").value,
    location:$("#eventLocation").value.trim(),description:$("#eventDescription").value.trim(),category:$("#eventCategory").value,
    capacity,createdAt:existing?.createdAt||new Date().toISOString()
  };
  if(!event.name||!event.date||!event.location){showToast("Please complete all required fields.",true);return;}
  if(existing) data.events=data.events.map(item=>item.id===id?event:item); else data.events.push(event);
  save();renderAll();closeModal("eventModal");showToast(existing?"Event updated successfully.":"Event created successfully.");
});
$("#registrationForm").addEventListener("submit",e=>{
  e.preventDefault();
  const eventId=$("#registrationEvent").value;
  const name=$("#attendeeName").value.trim();
  const email=$("#attendeeEmail").value.trim().toLowerCase();
  const event=eventById(eventId);
  if(!event){showToast("Please choose an event with available seats.",true);return;}
  if(attendeesFor(eventId).length>=event.capacity){showToast("Sorry, this event is full.",true);return;}
  if(data.attendees.some(person=>person.eventId===eventId&&person.email.toLowerCase()===email)){showToast("This email is already registered for the event.",true);return;}
  data.attendees.push({id:`reg-${Date.now()}`,eventId,name,email,registeredAt:new Date().toISOString()});
  save();renderAll();closeModal("registrationModal");showToast("Attendee registered successfully.");
});
$("#eventSearch").addEventListener("input",renderEvents);
$("#attendeeSearch").addEventListener("input",renderAttendees);
$("#registerTop").addEventListener("click",()=>openRegistrationModal());
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
document.addEventListener("keydown",e=>{if(e.key==="Escape")$$(".modal-backdrop").forEach(m=>m.classList.add("hidden"));});
$$(".year").forEach(el=>el.textContent=new Date().getFullYear());
renderAll();
