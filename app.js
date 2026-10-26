/* NammaOoru AI demo prototype. Cloudinary credentials are intentionally not embedded. */
const STORAGE_KEY = "nammaooru_reports_v1";
const demoReports = [
 {id:"demo1",title:"Pothole near the bus stop",category:"Road / pothole",area:"Main road · near bus stop",description:"A deep pothole makes it difficult for two-wheelers to pass safely, especially after rain.",reporter:"Neighbour",priority:"Urgent",status:"Open",votes:12,date:"Today",emoji:"🛣️"},
 {id:"demo2",title:"Garbage pile needs collection",category:"Garbage / cleanliness",area:"Market street corner",description:"Waste has been accumulating for several days and needs a collection visit.",reporter:"Local resident",priority:"Normal",status:"In progress",votes:8,date:"Yesterday",emoji:"🧹"},
 {id:"demo3",title:"Streetlight not working",category:"Streetlight",area:"Park entrance · Ward 12",description:"The streetlight near the park entrance has been off at night for about a week.",reporter:"Neighbour",priority:"Normal",status:"Open",votes:6,date:"2 days ago",emoji:"💡"}
];
const $ = id => document.getElementById(id);
let reports = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || demoReports;
let language = "en";
let uploadedUrl = "";
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(reports));}
function toast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>el.classList.remove("show"),2800);}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function render(){
 const cat=$("filterCategory").value, status=$("filterStatus").value;
 const shown=reports.filter(r=>(cat==="All"||r.category===cat)&&(status==="All"||r.status===status));
 $("statTotal").textContent=String(reports.length).padStart(2,"0");
 $("reportGrid").innerHTML=shown.map(r=>`<article class="report-card">
 <div class="report-photo">${r.photo?`<img src="${esc(r.photo)}" alt="Evidence for ${esc(r.title)}">`:`<span>${r.emoji||"📍"}</span>`}<span class="category-label">${esc(r.category)}</span></div>
 <div class="report-body"><div class="report-meta"><span>📍 ${esc(r.area)}</span><span class="status ${r.status.replace(/\s/g,"-")}">${esc(r.status)}</span></div>
 <h3>${esc(r.title)}</h3><p>${esc(r.description)}</p>
 <div class="report-footer"><span>By ${esc(r.reporter||"Neighbour")} · ${esc(r.date||"Today")}</span><button class="support-btn" data-vote="${esc(r.id)}">♡ Support ${r.votes||0}</button></div></div></article>`).join("");
 $("emptyState").hidden=shown.length!==0;
 document.querySelectorAll("[data-vote]").forEach(b=>b.addEventListener("click",()=>{const r=reports.find(x=>x.id===b.dataset.vote);if(r){r.votes=(r.votes||0)+1;save();render();toast("Thanks for supporting this community report.");}}));
}
$("filterCategory").addEventListener("change",render);$("filterStatus").addEventListener("change",render);
$("reportForm").addEventListener("submit",e=>{
 e.preventDefault();
 const report={id:"r"+Date.now(),title:$("issueTitle").value.trim(),category:$("category").value,area:$("area").value.trim(),description:$("description").value.trim(),reporter:$("reporter").value.trim()||"Neighbour",priority:$("urgency").value,status:"Open",votes:0,date:"Just now",photo:uploadedUrl,emoji:"📍"};
 if(!report.title||!report.category||!report.area||!report.description){toast("Please fill in all required fields.");return;}
 reports.unshift(report);save();render();e.target.reset();uploadedUrl="";$("photoUrl").value="";$("uploadStatus").textContent="No photo added";$("filterCategory").value="All";$("filterStatus").value="All";render();toast("Report published in this browser demo.");$("reports").scrollIntoView({behavior:"smooth"});
});
$("uploadBtn").addEventListener("click",()=>{
 const cloudName=window.NAMMAOORU_CLOUDINARY_CLOUD_NAME;
 const uploadPreset=window.NAMMAOORU_CLOUDINARY_UPLOAD_PRESET;
 if(!cloudName||!uploadPreset){toast("Photo upload setup needed: configure Cloudinary in app/cloudinary-config.js. You can still submit a text report.");return;}
 if(!window.cloudinary){toast("Cloudinary widget could not load. Check your internet connection.");return;}
 window.cloudinary.openUploadWidget({cloudName,uploadPreset,sources:["local","camera"],multiple:false,maxFileSize:5000000,clientAllowedFormats:["jpg","jpeg","png","webp"],folder:"nammaooru-reports"},(error,result)=>{
  if(!error&&result&&result.event==="success"){uploadedUrl=result.info.secure_url;$("photoUrl").value=uploadedUrl;$("uploadStatus").textContent="Photo added ✓";toast("Photo uploaded securely to Cloudinary.");}
  if(error)toast("Upload failed. Check Cloudinary settings and try again.");
 });
});
const translations={
en:{eyebrow:"CIVIC ACTION, MADE SIMPLE",heroTitle:"Your street.<br><em>Your voice.</em><br>Your NammaOoru.",heroText:"Report local problems with evidence, help neighbours see what needs attention, and track every issue from report to resolution.",reportBtn:"＋ Report an issue",exploreBtn:"Explore community reports ↓"},
ta:{eyebrow:"உள்ளூர் மாற்றம், எளிமையாக",heroTitle:"உங்கள் தெரு.<br><em>உங்கள் குரல்.</em><br>நம்ம ஊர்.",heroText:"புகைப்பட ஆதாரத்துடன் உள்ளூர் பிரச்சினைகளைப் பதிவு செய்யுங்கள். அக்கம்பக்கத்தினர் கவனம் செலுத்தவும், தீர்வு கிடைக்கும் வரை நிலையைப் பார்க்கவும் உதவுங்கள்.",reportBtn:"＋ பிரச்சினையைப் பதிவு செய்",exploreBtn:"மக்கள் பதிவுகளைப் பார் ↓"}
};
$("langToggle").addEventListener("click",()=>{language=language==="en"?"ta":"en";document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;el.innerHTML=translations[language][k]||el.innerHTML;});document.documentElement.lang=language;toast(language==="ta"?"தமிழ் முன்னோட்டம் இயக்கப்பட்டது.":"English preview enabled.");});
render();
