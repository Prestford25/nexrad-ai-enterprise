import { useState, useRef, useEffect } from "react";

// ════════════════════════════════════════════════════════════════════════════
//  DESIGN SYSTEM
// ════════════════════════════════════════════════════════════════════════════
const DS = {
  bg0:"#020810", bg1:"#060E1C", bg2:"#0A1628", bg3:"#0F1E35",
  s1:"#111E34", s2:"#162440", s3:"#1A2B49",
  b1:"#1E2D47", b2:"#243555", b3:"#2B3F65",
  cyan:"#00D4FF",  cyanL:"#33DDFF", cyanD:"#0088AA",
  teal:"#00C896",  tealD:"#008866",
  sky:"#38BDF8",
  indigo:"#6366F1", indigoL:"#818CF8",
  violet:"#7C3AED", violetL:"#A78BFA",
  rose:"#F43F5E",   roseL:"#FB7185",
  amber:"#F59E0B",  amberL:"#FCD34D",
  green:"#10B981",  greenL:"#34D399",
  t1:"#EEF4FF", t2:"#8BA3C7", t3:"#4A6080", t4:"#2A3C58",
};

// ════════════════════════════════════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════════════════════════════════════
const MODALITIES = [
  { id:"xray",   label:"Chest X-Ray",   icon:"🫁", col:DS.cyan,
    conditions:[
      {name:"Pneumonia",          icd:"J18.9",  sev:"High",     reg:"Right lower lobe consolidation",   prev:31},
      {name:"Tuberculosis",       icd:"A15.0",  sev:"High",     reg:"Upper lobe cavitary lesion",       prev:18},
      {name:"COVID-19",           icd:"U07.1",  sev:"High",     reg:"Bilateral peripheral GGO",         prev:22},
      {name:"Pleural Effusion",   icd:"J90",    sev:"Medium",   reg:"Right costophrenic blunting",      prev:14},
      {name:"Pneumothorax",       icd:"J93.1",  sev:"Critical", reg:"Left visceral pleural line",       prev:8},
    ],
    models:["vit","swin","effnet","resnet","cnn"],
  },
  { id:"mri",    label:"Brain MRI",     icon:"🧠", col:DS.violet,
    conditions:[
      {name:"Glioma",             icd:"C71.9",  sev:"Critical", reg:"Left frontal ring-enhancing mass", prev:28},
      {name:"Meningioma",         icd:"D32.9",  sev:"High",     reg:"Parasagittal dural-based mass",    prev:22},
      {name:"Pituitary Tumor",    icd:"D35.2",  sev:"Medium",   reg:"Sella turcica expansion",          prev:17},
      {name:"Stroke",             icd:"I63.9",  sev:"Critical", reg:"Left MCA DWI restriction",         prev:19},
      {name:"Multiple Sclerosis", icd:"G35",    sev:"Medium",   reg:"Periventricular Dawson fingers",   prev:14},
    ],
    models:["vit","swin","unet","medsam","densenet"],
  },
  { id:"ct",     label:"CT Scan",       icon:"🫀", col:DS.teal,
    conditions:[
      {name:"Lung Nodules",       icd:"R91.1",  sev:"Medium",   reg:"RLL 8mm spiculated nodule",        prev:35},
      {name:"Pulm. Embolism",     icd:"I26.99", sev:"Critical", reg:"Saddle embolus, main PA",          prev:20},
      {name:"Aortic Aneurysm",    icd:"I71.4",  sev:"Critical", reg:"Infrarenal AAA 5.8cm",             prev:15},
      {name:"Liver Tumor",        icd:"C22.0",  sev:"High",     reg:"Right hepatic lobe HCC 4.2cm",     prev:18},
    ],
    models:["swin","unet","medsam","unet3d","effnet"],
  },
  { id:"fundus", label:"Retinal Fundus", icon:"👁", col:DS.amber,
    conditions:[
      {name:"Diabetic Retinopathy",icd:"E11.319",sev:"High",   reg:"Macular microaneurysms + exudates",prev:42},
      {name:"Glaucoma",            icd:"H40.9",  sev:"Medium", reg:"Optic disc CDR 0.8 + RNFL thin",  prev:28},
      {name:"Macular Degeneration",icd:"H35.30", sev:"High",   reg:"Foveal drusen + geographic atrophy",prev:30},
    ],
    models:["vit","effnet","resnet","densenet"],
  },
];

const MODELS = [
  {id:"vit",     name:"Vision Transformer", short:"ViT-L/16",     acc:98.3,f1:0.983,auc:0.997,p:"307M",spd:"1.8s",badge:"SOTA",      col:DS.cyan,   type:"Classification"},
  {id:"swin",    name:"Swin Transformer",   short:"Swin-B",       acc:97.1,f1:0.971,auc:0.994,p:"88M", spd:"1.2s",badge:"Balanced",  col:DS.teal,   type:"Classification"},
  {id:"effnet",  name:"EfficientNetV2",     short:"EfficientV2-L",acc:96.8,f1:0.968,auc:0.991,p:"120M",spd:"0.9s",badge:"Fast",      col:DS.sky,    type:"Classification"},
  {id:"unet",    name:"Attention U-Net",    short:"AttU-Net",     acc:95.4,f1:0.954,auc:0.988,p:"31M", spd:"2.1s",badge:"Segment",   col:DS.violet, type:"Segmentation"},
  {id:"medsam",  name:"MedSAM Foundation",  short:"SAM-Med",      acc:94.9,f1:0.949,auc:0.985,p:"636M",spd:"3.4s",badge:"Foundation",col:DS.indigo, type:"Foundation"},
  {id:"unet3d",  name:"3D nnU-Net",         short:"nnU-Net-3D",   acc:94.2,f1:0.942,auc:0.982,p:"58M", spd:"4.2s",badge:"Volumetric",col:DS.amber,  type:"Volumetric"},
  {id:"resnet",  name:"ResNet152",          short:"ResNet-152",   acc:93.7,f1:0.937,auc:0.978,p:"60M", spd:"0.4s",badge:"Stable",    col:DS.green,  type:"Classification"},
  {id:"densenet",name:"DenseNet201",        short:"DenseNet-201", acc:92.1,f1:0.921,auc:0.974,p:"20M", spd:"0.3s",badge:"Light",     col:DS.t2,     type:"Classification"},
  {id:"cnn",     name:"CNN Baseline",       short:"Custom CNN",   acc:89.3,f1:0.891,auc:0.961,p:"8M",  spd:"0.1s",badge:"Baseline",  col:DS.t3,     type:"Baseline"},
];

const XAI = {
  "Pneumonia":            {gcam:"Dense airspace opacity in right lower lobe with air bronchograms and peripheral distribution consistent with lobar consolidation.",shap:[["Opacity density",0.91],["Air bronchogram",0.78],["Bronchial thickening",0.64],["Vascular congestion",0.52],["Pleural reaction",0.38]],lime:"Patchy lobar consolidation in RLL is the dominant AI signal. Geographic distribution and density pattern reinforced classification at 96% confidence."},
  "Tuberculosis":         {gcam:"Bilateral upper lobe heterogeneous opacification with cavitary lesion and satellite nodules.",shap:[["Cavitary lesion",0.88],["Apical shadowing",0.74],["Hilar lymphadenopathy",0.63],["Fibronodular change",0.50],["Pleural thickening",0.37]],lime:"Upper lobe cavitation with satellite nodules — reactivation TB pattern. Ghon complex absent. AI confidence 78%."},
  "COVID-19":             {gcam:"Bilateral peripheral and basal ground-glass opacities with crazy-paving pattern.",shap:[["Bilateral GGO",0.93],["Peripheral dist.",0.82],["Crazy-paving",0.67],["Consolidation",0.58],["Vascular dilation",0.44]],lime:"Peripheral bilateral GGO with posterior predominance. COVID-19 pattern score 89%. Bacterial superinfection cannot be excluded."},
  "Pleural Effusion":     {gcam:"Right-sided meniscus sign with costophrenic angle blunting, estimated 800mL.",shap:[["Meniscus sign",0.89],["Volume estimate",0.73],["Septations absent",0.55],["No shift",0.48],["Subpulmonic",0.36]],lime:"Moderate right pleural effusion. No mediastinal shift — likely uncomplicated transudative process. Recommend US-guided tap if clinically indicated."},
  "Pneumothorax":         {gcam:"Left visceral pleural line with complete absence of lung markings peripherally.",shap:[["Pleural line",0.95],["Absent markings",0.84],["Deep sulcus sign",0.72],["Lung collapse",0.61],["Mediastinal shift",0.58]],lime:"Tension pneumothorax pattern. AI confidence 97%. Visceral pleural line clearly visualised — emergent needle decompression indicated."},
  "Glioma":               {gcam:"Left frontal heterogeneous ring-enhancing mass with surrounding T2 vasogenic edema and mass effect.",shap:[["Ring enhancement",0.92],["Vasogenic edema",0.81],["Mass effect",0.68],["Midline shift 6mm",0.57],["Necrotic core",0.49]],lime:"Ring-enhancing 4.8cm mass with edema and 6mm midline shift. WHO Grade IV glioblastoma pattern. Neurosurgery referral urgent."},
  "Meningioma":           {gcam:"Parasagittal convexity extra-axial dural-based homogeneous mass with classic dural tail.",shap:[["Dural tail sign",0.87],["Homogeneous enh.",0.76],["Calcification",0.62],["Cortex buckling",0.51],["Venous sinus",0.44]],lime:"Well-circumscribed homogeneously enhancing extra-axial mass with dural tail — pathognomonic for meningioma. Likely WHO Grade I."},
  "Pituitary Tumor":      {gcam:"Sella turcica expansion with suprasellar extension approaching the optic chiasm.",shap:[["Sella expansion",0.84],["Suprasellar ext.",0.71],["Optic chiasm",0.63],["Cavernous invasion",0.48],["Stalk deviation",0.41]],lime:"Macroadenoma >10mm with suprasellar extension. Optic chiasm proximity requires ophthalmological assessment. Endocrine workup indicated."},
  "Stroke":               {gcam:"Left MCA territory acute infarct — DWI hyperintensity with corresponding ADC hypointensity.",shap:[["DWI restriction",0.96],["ADC mismatch",0.85],["FLAIR evolving",0.74],["Cortical involvement",0.62],["Volume 48mL",0.55]],lime:"Acute ischaemic infarct left MCA territory ~48mL. DWI-ADC mismatch suggests penumbra present. Thrombolysis window assessment required."},
  "Multiple Sclerosis":   {gcam:"Periventricular Dawson's finger lesions with callosal and juxtacortical involvement.",shap:[["Periventricular WM",0.88],["Ovoid morphology",0.75],["Enhancement pattern",0.61],["Lesion load T2",0.52],["Callosal sign",0.47]],lime:"Multiple periventricular T2/FLAIR hyperintense lesions in Dawson finger orientation. McDonald 2017 criteria met — spatial and temporal dissemination confirmed."},
  "Lung Nodules":         {gcam:"Right lower lobe 8mm spiculated part-solid nodule with pleural tethering.",shap:[["Spiculation",0.91],["Part-solid",0.79],["Diameter 8mm",0.68],["Pleural tethering",0.55],["Location RLL",0.43]],lime:"Solitary 8mm spiculated part-solid nodule RLL. Fleischner Society: high-risk — CT follow-up at 3 months. PET-CT may be warranted."},
  "Pulm. Embolism":       {gcam:"Saddle embolus at main pulmonary artery bifurcation with bilateral lobar branch filling defects.",shap:[["Saddle filling defect",0.94],["Bilateral ext.",0.83],["RV dilation",0.71],["Septal bowing",0.58],["Infarct wedge",0.44]],lime:"Massive saddle PE with biventricular strain. RV:LV ratio 1.4. PESI class V. Systemic thrombolysis vs catheter-directed therapy urgently required."},
  "Aortic Aneurysm":      {gcam:"Fusiform infrarenal AAA maximal diameter 5.8cm with circumferential mural thrombus.",shap:[["Max diam 5.8cm",0.93],["Mural thrombus",0.79],["Wall calcification",0.65],["Iliac extension",0.52],["Periaortic change",0.41]],lime:"Infrarenal AAA 5.8cm exceeding surgical threshold. Circumferential mural thrombus. Urgent vascular surgery referral for EVAR vs open repair."},
  "Liver Tumor":          {gcam:"Segment VI hepatic arterial enhancing 4.2cm mass with portal venous washout — LI-RADS 5.",shap:[["Arterial enh.",0.90],["Portal washout",0.77],["Capsule",0.63],["Diameter 4.2cm",0.54],["Background cirrhosis",0.47]],lime:"LI-RADS 5 — hepatocellular carcinoma. Classic enhancement in cirrhotic liver. BCLC Stage B. Multidisciplinary liver tumour board referral."},
  "Diabetic Retinopathy": {gcam:"Macular microaneurysms, hard exudates within 1 disc diameter of fovea, dot-blot haemorrhages.",shap:[["Microaneurysm ct.",0.89],["Hard exudates",0.77],["Haemorrhages",0.63],["Neovascularisation",0.55],["CWS",0.42]],lime:"Moderate NPDR with CSMO. Exudates within 500μm of foveal centre. Intravitreal anti-VEGF therapy indicated."},
  "Glaucoma":             {gcam:"Enlarged cup-to-disc ratio 0.8 with inferior RNFL thinning and inferior notching.",shap:[["CDR 0.8",0.92],["RNFL inf. thin",0.81],["Disc asymmetry",0.67],["Inferior notch",0.55],["IOP correlation",0.43]],lime:"Advanced glaucomatous cupping CDR 0.8 with inferior RNFL thinning. Correlate Humphrey VF and IOP. Topical prostaglandin analogue or trabeculectomy."},
  "Macular Degeneration": {gcam:"Bilateral foveal soft confluent drusen with geographic atrophy and early CNV in right eye.",shap:[["Drusen density",0.88],["Geographic atrophy",0.74],["Subretinal fluid",0.61],["RPE disruption",0.52],["CNV right eye",0.44]],lime:"Intermediate AMD bilateral, advanced AMD right eye. CNV confirmed — anti-VEGF indicated. AREDS2 supplementation. Low vision referral."},
};

const PATIENTS = [
  {id:"PT-24001",name:"Amara Osei",         age:54,sex:"F",mrn:"MRN-88412",dob:"1970-03-12",blood:"A+", ward:"Radiology A",    mod:"Chest X-Ray",    cond:"Pneumonia",            conf:96.2,risk:"High",    sts:"Pending Review",date:"2026-06-21",study:"ST-9901",pri:2,ref:"Dr. Adjei",   notes:"Cough 5 days, fever 38.9°C"},
  {id:"PT-24002",name:"James Kariuki",      age:38,sex:"M",mrn:"MRN-77233",dob:"1988-07-04",blood:"O+", ward:"Neurology",      mod:"Brain MRI",      cond:"Glioma",               conf:91.7,risk:"Critical",sts:"Reviewed",      date:"2026-06-21",study:"ST-9902",pri:1,ref:"Dr. Mwenda",  notes:"6-week headache, papilloedema"},
  {id:"PT-24003",name:"Fatima Al-Hassan",   age:61,sex:"F",mrn:"MRN-66144",dob:"1965-01-22",blood:"B+", ward:"Oncology",       mod:"CT Scan",        cond:"Lung Nodules",         conf:84.3,risk:"Medium",  sts:"Reported",      date:"2026-06-20",study:"ST-9903",pri:3,ref:"Dr. Hassan",  notes:"Ex-smoker, routine surveillance"},
  {id:"PT-24004",name:"David Mwangi",       age:45,sex:"M",mrn:"MRN-55090",dob:"1981-09-15",blood:"AB-",ward:"Ophthalmology",  mod:"Retinal Fundus", cond:"Diabetic Retinopathy", conf:93.1,risk:"High",    sts:"Pending Review",date:"2026-06-20",study:"ST-9904",pri:2,ref:"Dr. Osei",    notes:"T2DM 12y, HbA1c 9.4%"},
  {id:"PT-24005",name:"Sarah Nkosi",        age:29,sex:"F",mrn:"MRN-44021",dob:"1997-11-08",blood:"O-", ward:"Infectious Dis.",mod:"Chest X-Ray",    cond:"Tuberculosis",         conf:78.4,risk:"Medium",  sts:"Reviewed",      date:"2026-06-20",study:"ST-9905",pri:3,ref:"Dr. Nkosi",   notes:"Contact with TB+ patient"},
  {id:"PT-24006",name:"Emmanuel Tetteh",    age:67,sex:"M",mrn:"MRN-33912",dob:"1959-05-30",blood:"A-", ward:"Neurology",      mod:"Brain MRI",      cond:"Meningioma",           conf:88.9,risk:"High",    sts:"Reported",      date:"2026-06-19",study:"ST-9906",pri:2,ref:"Dr. Annan",   notes:"Seizure onset, no prior history"},
  {id:"PT-24007",name:"Nadia Kamara",       age:52,sex:"F",mrn:"MRN-22801",dob:"1974-02-17",blood:"B-", ward:"Emergency",      mod:"CT Scan",        cond:"Pulm. Embolism",       conf:95.6,risk:"Critical",sts:"Pending Review",date:"2026-06-19",study:"ST-9907",pri:1,ref:"Dr. Kamara",  notes:"Sudden dyspnoea, sats 88%"},
  {id:"PT-24008",name:"Kwame Asante",       age:73,sex:"M",mrn:"MRN-11700",dob:"1953-08-24",blood:"A+", ward:"Vascular",       mod:"CT Scan",        cond:"Aortic Aneurysm",      conf:92.8,risk:"Critical",sts:"Pending Review",date:"2026-06-19",study:"ST-9908",pri:1,ref:"Dr. Asante",  notes:"Pulsatile abdominal mass"},
  {id:"PT-24009",name:"Priya Sharma",       age:41,sex:"F",mrn:"MRN-00654",dob:"1985-04-11",blood:"O+", ward:"Neurology",      mod:"Brain MRI",      cond:"Stroke",               conf:97.3,risk:"Critical",sts:"Reviewed",      date:"2026-06-18",study:"ST-9909",pri:1,ref:"Dr. Sharma",  notes:"Sudden dysphasia + right hemiplegia"},
  {id:"PT-24010",name:"Hassan Diallo",      age:58,sex:"M",mrn:"MRN-99543",dob:"1968-12-03",blood:"AB+",ward:"Respiratory",    mod:"Chest X-Ray",    cond:"COVID-19",             conf:89.1,risk:"High",    sts:"Reported",      date:"2026-06-18",study:"ST-9910",pri:2,ref:"Dr. Diallo",  notes:"Hypoxia, bilateral crackles"},
  {id:"PT-24011",name:"Aisha Conteh",       age:35,sex:"F",mrn:"MRN-88001",dob:"1991-06-22",blood:"A+", ward:"Ophthalmology",  mod:"Retinal Fundus", cond:"Glaucoma",             conf:82.7,risk:"Medium",  sts:"Reported",      date:"2026-06-17",study:"ST-9911",pri:3,ref:"Dr. Mensah",  notes:"IOP 28mmHg bilateral"},
  {id:"PT-24012",name:"Robert Asiedu",      age:65,sex:"M",mrn:"MRN-77002",dob:"1961-03-07",blood:"B+", ward:"Hepatology",     mod:"CT Scan",        cond:"Liver Tumor",          conf:90.4,risk:"High",    sts:"Pending Review",date:"2026-06-17",study:"ST-9912",pri:2,ref:"Dr. Boateng", notes:"Cirrhosis known, AFP raised"},
];

const AUDIT_LOGS = [
  {ts:"14:32:08",user:"Dr. Okonkwo",   role:"Radiologist",   action:"Approved report",       target:"PT-24003",ip:"10.0.1.14",sid:"SES-4421",result:"Success"},
  {ts:"14:18:45",user:"Tech. Mensah",  role:"Technician",    action:"Uploaded DICOM series", target:"PT-24007",ip:"10.0.1.22",sid:"SES-4420",result:"Success"},
  {ts:"13:55:20",user:"Dr. Al-Farsi",  role:"Radiologist",   action:"Added annotation",      target:"PT-24002",ip:"10.0.1.31",sid:"SES-4419",result:"Success"},
  {ts:"13:40:12",user:"Admin",         role:"Administrator", action:"Created user account",  target:"Tech. Eze",ip:"10.0.1.5", sid:"SES-4418",result:"Success"},
  {ts:"13:22:07",user:"Dr. Okonkwo",   role:"Radiologist",   action:"Viewed scan",           target:"PT-24001",ip:"10.0.1.14",sid:"SES-4417",result:"Success"},
  {ts:"12:58:33",user:"Tech. Boateng", role:"Technician",    action:"Uploaded DICOM",        target:"PT-24006",ip:"10.0.1.19",sid:"SES-4416",result:"Success"},
  {ts:"12:40:00",user:"Dr. Sharma",    role:"Radiologist",   action:"Override AI finding",   target:"PT-24009",ip:"10.0.1.28",sid:"SES-4415",result:"Override"},
  {ts:"11:55:14",user:"Admin",         role:"Administrator", action:"Exported audit log",    target:"ALL",     ip:"10.0.1.5", sid:"SES-4414",result:"Success"},
  {ts:"11:30:00",user:"Dr. Mwenda",    role:"Radiologist",   action:"Rejected AI suggestion",target:"PT-24006",ip:"10.0.1.33",sid:"SES-4413",result:"Override"},
  {ts:"10:45:22",user:"Tech. Mensah",  role:"Technician",    action:"Tagged study urgent",   target:"PT-24007",ip:"10.0.1.22",sid:"SES-4412",result:"Success"},
];

const MONTHLY = [
  {m:"Jan",acc:91.2,cases:142,crit:8, rep:138,time:2.8},
  {m:"Feb",acc:92.8,cases:168,crit:11,rep:161,time:2.3},
  {m:"Mar",acc:93.5,cases:191,crit:14,rep:188,time:1.9},
  {m:"Apr",acc:94.1,cases:205,crit:12,rep:201,time:1.7},
  {m:"May",acc:95.9,cases:228,crit:17,rep:224,time:1.5},
  {m:"Jun",acc:96.8,cases:247,crit:19,rep:242,time:1.4},
];

const PIPELINE = [
  {id:"recv", label:"DICOM Receive",  icon:"📡",desc:"Parsing headers, validating SOP class, extracting metadata"},
  {id:"pre",  label:"Preprocess",     icon:"⚙", desc:"Resize 512×512 → Normalize → Window/Level → Tensor"},
  {id:"aug",  label:"Augment",        icon:"🔄",desc:"Flip, rotation ±15°, elastic deformation, brightness jitter"},
  {id:"inf",  label:"Inference",      icon:"🧠",desc:"Ensemble forward pass — softmax voting across models"},
  {id:"gcam", label:"Grad-CAM",       icon:"🔥",desc:"Gradient-weighted class activation mapping — conv5_4"},
  {id:"shap", label:"SHAP",           icon:"📊",desc:"TreeExplainer computing Shapley attribution values"},
  {id:"cds",  label:"Clinical Logic", icon:"⚕", desc:"Disease thresholds, triage scoring, ICD-10 coding"},
  {id:"rep",  label:"Report Gen",     icon:"📄",desc:"LLM synthesizing structured HL7 FHIR radiology report"},
];

// ════════════════════════════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
const riskMeta = r => ({
  Critical:{bg:"rgba(244,63,94,.13)",  tx:"#FB7185", bdr:"rgba(244,63,94,.35)",  dot:DS.roseL},
  High:    {bg:"rgba(245,158,11,.13)", tx:"#FCD34D", bdr:"rgba(245,158,11,.35)", dot:DS.amberL},
  Medium:  {bg:"rgba(16,185,129,.13)", tx:"#34D399", bdr:"rgba(16,185,129,.35)", dot:DS.greenL},
  Low:     {bg:"rgba(99,102,241,.13)", tx:"#818CF8", bdr:"rgba(99,102,241,.35)", dot:DS.indigoL},
})[r] || {bg:DS.bg3, tx:DS.t2, bdr:DS.b1, dot:DS.t2};

const statusCol = s => s==="Pending Review"?DS.amber:s==="Reviewed"?DS.green:DS.t2;

function Badge({label,col,sm}){
  return <span style={{fontSize:sm?9:10,fontWeight:700,letterSpacing:".07em",textTransform:"uppercase",
    background:`${col}20`,color:col,border:`1px solid ${col}40`,borderRadius:4,
    padding:sm?"1px 5px":"2px 8px",whiteSpace:"nowrap",flexShrink:0}}>{label}</span>;
}

function SLabel({children,style={}}){
  return <div style={{fontSize:9,fontWeight:700,letterSpacing:".12em",textTransform:"uppercase",
    color:DS.t4,marginBottom:8,paddingBottom:5,borderBottom:`1px solid ${DS.b1}`,...style}}>{children}</div>;
}

function Card({children,style={}}){
  return <div style={{background:DS.s1,border:`1px solid ${DS.b1}`,borderRadius:11,...style}}>{children}</div>;
}

function MiniBar({v,col=DS.cyan,h=5}){
  return <div style={{background:DS.b1,borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${v}%`,background:col,height:h,borderRadius:99,
      boxShadow:`0 0 6px ${col}50`,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/>
  </div>;
}

function Kpi({label,val,delta,icon,col=DS.cyan}){
  return <div style={{background:DS.s1,border:`1px solid ${DS.b1}`,borderRadius:10,
    padding:"15px 16px",flex:1,minWidth:110,position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 90% 10%, ${col}10 0%, transparent 60%)`}}/>
    <div style={{fontSize:9,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:DS.t3,marginBottom:7}}>{label}</div>
    <div style={{fontSize:26,fontWeight:800,color:col,lineHeight:1,marginBottom:3}}>{val}</div>
    {delta&&<div style={{fontSize:10,color:delta.startsWith("+")?DS.green:DS.rose}}>{delta}</div>}
    <div style={{position:"absolute",bottom:10,right:12,fontSize:20,opacity:.15}}>{icon}</div>
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  DICOM VIEWER
// ════════════════════════════════════════════════════════════════════════════
function DicomViewer({modId, condName, conf=91, gcam=false, compact=false}){
  const [br,setBr]=useState(100);
  const [ct,setCt]=useState(108);
  const [zm,setZm]=useState(100);
  const [wl,setWl]=useState(40);
  const [ww,setWw]=useState(400);
  const [tool,setTool]=useState("pan");

  const zones={
    "Pneumonia":           [{x:54,y:48,w:33,h:27,c:DS.roseL,  l:"Consolidation RLL"}],
    "Tuberculosis":        [{x:18,y:8, w:28,h:24,c:DS.amberL, l:"Cavitation"},{x:56,y:6,w:24,h:21,c:DS.amberL,l:"Infiltrate"}],
    "COVID-19":            [{x:10,y:30,w:28,h:32,c:DS.roseL,  l:"GGO L"},{x:63,y:33,w:26,h:30,c:DS.roseL,l:"GGO R"}],
    "Pleural Effusion":    [{x:60,y:40,w:32,h:42,c:DS.sky,    l:"Effusion ~800mL"}],
    "Pneumothorax":        [{x:6, y:8, w:9, h:58,c:DS.violetL,l:"Pleural line"}],
    "Glioma":              [{x:26,y:14,w:40,h:34,c:DS.roseL,  l:"GBM mass + edema"}],
    "Meningioma":          [{x:34,y:4, w:32,h:24,c:DS.amberL, l:"Extra-axial mass"}],
    "Pituitary Tumor":     [{x:39,y:55,w:22,h:18,c:DS.violetL,l:"Sellar mass"}],
    "Stroke":              [{x:13,y:18,w:36,h:32,c:DS.roseL,  l:"MCA infarct DWI"}],
    "Multiple Sclerosis":  [{x:22,y:18,w:14,h:9,c:DS.sky,l:"PV"},{x:56,y:16,w:12,h:8,c:DS.sky,l:"WM"},{x:36,y:38,w:9,h:7,c:DS.sky,l:"Call."}],
    "Lung Nodules":        [{x:59,y:43,w:15,h:14,c:DS.amberL, l:"8mm nodule"}],
    "Pulm. Embolism":      [{x:33,y:26,w:34,h:20,c:DS.roseL,  l:"Saddle embolus"}],
    "Aortic Aneurysm":     [{x:34,y:36,w:30,h:30,c:DS.roseL,  l:"AAA 5.8cm"}],
    "Liver Tumor":         [{x:54,y:28,w:28,h:26,c:DS.roseL,  l:"HCC Seg VI"}],
    "Diabetic Retinopathy":[{x:30,y:26,w:32,h:30,c:DS.amberL, l:"Macular CSMO"}],
    "Glaucoma":            [{x:38,y:28,w:24,h:24,c:DS.roseL,  l:"CDR 0.8"}],
    "Macular Degeneration":[{x:34,y:30,w:28,h:22,c:DS.amberL, l:"Drusen + GA"}],
  };
  const hz = zones[condName]||[{x:35,y:33,w:28,h:22,c:DS.cyan,l:"ROI"}];

  const anatomy = () => {
    if(modId==="xray") return <>
      <ellipse cx="36" cy="39" rx="21" ry="30" fill="#0B1C30"/>
      <ellipse cx="64" cy="39" rx="21" ry="30" fill="#0B1C30"/>
      <rect x="43" y="9" width="14" height="57" rx="3" fill="#071422"/>
      {[18,26,34,42,50,58,66].map(y=><g key={y}>
        <line x1="17" y1={y} x2="32" y2={y+2} stroke="#162235" strokeWidth=".8"/>
        <line x1="83" y1={y} x2="68" y2={y+2} stroke="#162235" strokeWidth=".8"/>
      </g>)}
      <ellipse cx="50" cy="17" rx="8" ry="5" fill="#091828"/>
      <rect x="47" y="62" width="6" height="8" fill="#071422" rx="1"/>
    </>;
    if(modId==="mri") return <>
      <ellipse cx="50" cy="40" rx="41" ry="35" fill="#0B1C30"/>
      <ellipse cx="50" cy="40" rx="33" ry="28" fill="#081628"/>
      <ellipse cx="50" cy="40" rx="23" ry="20" fill="#0C1E32"/>
      <path d="M50 12 Q53 26 50 40 Q47 54 50 68" stroke="#172538" strokeWidth=".6" fill="none"/>
      <path d="M16 40 Q33 29 50 40 Q67 51 84 40" stroke="#172538" strokeWidth=".5" fill="none"/>
      <ellipse cx="50" cy="64" rx="9" ry="6" fill="#081628"/>
      <ellipse cx="36" cy="52" rx="5" ry="7" fill="#0B1C30"/>
      <ellipse cx="64" cy="52" rx="5" ry="7" fill="#0B1C30"/>
    </>;
    if(modId==="ct") return <>
      <ellipse cx="50" cy="40" rx="44" ry="34" fill="#060E1C"/>
      <ellipse cx="36" cy="40" rx="18" ry="25" fill="#0B1C30"/>
      <ellipse cx="64" cy="40" rx="18" ry="25" fill="#0B1C30"/>
      <ellipse cx="50" cy="40" rx="6" ry="21" fill="#071422"/>
      <circle cx="50" cy="40" r="9" fill="#0C1E32"/>
      {[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return(
        <line key={a} x1={50+Math.cos(r)*9} y1={40+Math.sin(r)*9}
          x2={50+Math.cos(r)*44} y2={40+Math.sin(r)*34} stroke="#0F1E32" strokeWidth=".3"/>
      )})}
    </>;
    return <>
      <circle cx="50" cy="40" r="37" fill="#060E1C"/>
      <circle cx="50" cy="40" r="31" fill="#0B1C30"/>
      <circle cx="50" cy="40" r="6"  fill="#071422"/>
      {[0,40,80,120,160,200,240,280,320].map(a=>{const r=a*Math.PI/180;return(
        <line key={a} x1={50+Math.cos(r)*6} y1={40+Math.sin(r)*6}
          x2={50+Math.cos(r)*29} y2={40+Math.sin(r)*29} stroke="#172538" strokeWidth=".4"/>
      )})}
      <circle cx="63" cy="34" r="3" fill="#172538"/>
    </>;
  };

  return <div style={{background:"#000",borderRadius:10,overflow:"hidden",position:"relative"}}>
    <div style={{position:"relative",width:"100%",paddingTop:compact?"60%":"70%",
      filter:`brightness(${br}%) contrast(${ct}%)`}}>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <svg viewBox="0 0 100 80" width={`${zm}%`} height={`${zm}%`}
          style={{maxWidth:"100%",maxHeight:"100%",transition:"all .3s"}}>
          <rect width="100" height="80" fill="#020810"/>
          {anatomy()}
          {gcam&&hz.map((z,i)=><g key={i}>
            <rect x={z.x-1} y={z.y-1} width={z.w+2} height={z.h+2} rx="3"
              fill={`${z.c}15`} stroke={z.c} strokeWidth=".55" strokeDasharray="2.5 1.5"/>
            <rect x={z.x+1} y={z.y+1} width={z.w-2} height={z.h-2} rx="2" fill={`${z.c}25`}/>
            <text x={z.x+z.w/2} y={z.y-2.5} textAnchor="middle" fill={z.c} fontSize="3.8" fontFamily="monospace">{z.l}</text>
          </g>)}
          {[[5,2],[93,2],[5,75],[93,75]].map(([x,y],i)=><g key={i}>
            <line x1={x} y1={y} x2={x+(x<50?4:-4)} y2={y} stroke={DS.t4} strokeWidth=".4"/>
            <line x1={x} y1={y} x2={x} y2={y+(y<40?3:-3)} stroke={DS.t4} strokeWidth=".4"/>
          </g>)}
          {gcam&&<g>
            <rect x="2" y="2" width="46" height="13" rx="2" fill="rgba(0,0,0,.78)"/>
            <text x="4" y="8.8" fill={DS.cyan} fontSize="4.5" fontFamily="monospace" fontWeight="bold">{condName}</text>
            <text x="4" y="13.5" fill={DS.t2} fontSize="3" fontFamily="monospace">CONF {conf}% · GRAD-CAM · AI</text>
          </g>}
          <text x="98" y="78" textAnchor="end" fill={DS.t4} fontSize="2.5" fontFamily="monospace">WL:{wl} WW:{ww}</text>
          <text x="50" y="78" textAnchor="middle" fill={DS.t4} fontSize="2.3" fontFamily="monospace">
            NEXRAD·AI · {(modId||"").toUpperCase()} · {new Date().toLocaleDateString()}
          </text>
          <line x1="80" y1="74" x2="94" y2="74" stroke={DS.t4} strokeWidth=".5"/>
          <text x="87" y="72" textAnchor="middle" fill={DS.t4} fontSize="2.3" fontFamily="monospace">10mm</text>
        </svg>
      </div>
      {gcam&&<div style={{position:"absolute",top:8,right:8,display:"flex",alignItems:"center",
        gap:5,background:"rgba(0,0,0,.82)",borderRadius:5,padding:"3px 9px",
        border:`1px solid ${DS.rose}40`}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:DS.rose,
          boxShadow:`0 0 7px ${DS.rose}`,animation:"pulse 2s infinite"}}/>
        <span style={{fontSize:9,color:DS.roseL,fontWeight:700,letterSpacing:".08em"}}>GRAD-CAM ACTIVE</span>
      </div>}
    </div>
    {!compact&&<div style={{background:"rgba(2,8,16,.97)",borderTop:`1px solid ${DS.b1}`,
      padding:"7px 12px",display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      {[["🔆",br,setBr],["◐",ct,setCt]].map(([ic,v,fn],i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:5,
          background:DS.bg3,borderRadius:5,padding:"3px 8px"}}>
          <span style={{fontSize:11}}>{ic}</span>
          <input type="range" min={50} max={200} value={v}
            onChange={e=>fn(+e.target.value)}
            style={{width:54,accentColor:DS.cyan,cursor:"pointer"}}/>
          <span style={{fontSize:9,color:DS.t2,minWidth:28}}>{v}%</span>
        </div>
      ))}
      <div style={{display:"flex",gap:2}}>
        {[["−",()=>setZm(z=>Math.max(60,z-15))],["⬜",()=>setZm(100)],["+",()=>setZm(z=>Math.min(180,z+15))]].map(([l,fn])=>(
          <button key={l} onClick={fn} style={{background:DS.bg3,border:`1px solid ${DS.b2}`,
            color:DS.t2,fontSize:11,cursor:"pointer",padding:"3px 8px",borderRadius:4,fontWeight:700}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:2}}>
        {[["🖐","pan"],["📏","ruler"],["🔍","zoom"]].map(([ic,id])=>(
          <button key={id} onClick={()=>setTool(id)} style={{
            background:tool===id?`${DS.cyan}20`:DS.bg3,
            border:`1px solid ${tool===id?DS.cyan:DS.b2}`,
            color:tool===id?DS.cyan:DS.t2,
            fontSize:11,cursor:"pointer",padding:"3px 8px",borderRadius:4}}>{ic}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:7,marginLeft:"auto",alignItems:"center"}}>
        {[["WL",wl,setWl,-200,400],["WW",ww,setWw,1,2000]].map(([lb,v,fn,mn,mx])=>(
          <div key={lb} style={{display:"flex",alignItems:"center",gap:4}}>
            <span style={{fontSize:9,color:DS.t3}}>{lb}</span>
            <input type="number" value={v} onChange={e=>fn(+e.target.value)} min={mn} max={mx}
              style={{width:50,background:DS.bg3,border:`1px solid ${DS.b1}`,borderRadius:4,
                padding:"2px 5px",fontSize:10,color:DS.t1,textAlign:"center"}}/>
          </div>
        ))}
        {gcam&&<Badge label="AI Annotated" col={DS.cyan} sm/>}
      </div>
    </div>}
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  XAI PANEL
// ════════════════════════════════════════════════════════════════════════════
function XaiPanel({condName}){
  const x = XAI[condName]||XAI["Pneumonia"];
  const [tab,setTab]=useState("gcam");
  const cols=[DS.cyan,DS.teal,DS.sky,DS.violet,DS.amber];

  return <div>
    <div style={{display:"flex",gap:3,marginBottom:14}}>
      {[["gcam","Grad-CAM"],["shap","SHAP"],["lime","LIME"],["cons","Consensus"]].map(([id,lb])=>(
        <button key={id} onClick={()=>setTab(id)} style={{
          flex:1,padding:"5px 0",fontSize:10,fontWeight:700,cursor:"pointer",
          background:tab===id?`${DS.cyan}18`:"transparent",
          border:`1px solid ${tab===id?DS.cyan:DS.b2}`,
          borderRadius:6,color:tab===id?DS.cyan:DS.t3,transition:"all .15s"}}>{lb}</button>
      ))}
    </div>

    {tab==="gcam"&&<div>
      <SLabel>Localization · Spatial Attention</SLabel>
      <div style={{background:`${DS.rose}0C`,border:`1px solid ${DS.rose}25`,borderRadius:8,
        padding:"10px 12px",borderLeft:`3px solid ${DS.rose}`,marginBottom:12}}>
        <div style={{fontSize:9,color:DS.rose,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:5}}>Region of Interest</div>
        <div style={{fontSize:12,color:DS.t2,lineHeight:1.7}}>{x.gcam}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[["Activation","0.94",DS.cyan],["Coverage","34%",DS.teal],["Specificity","High",DS.green],["Conv Layer","conv5_4",DS.violet]].map(([l,v,c])=>(
          <div key={l} style={{background:DS.bg3,borderRadius:7,padding:"9px 10px"}}>
            <div style={{fontSize:9,color:DS.t4,textTransform:"uppercase",letterSpacing:".07em",marginBottom:3}}>{l}</div>
            <div style={{fontSize:14,fontWeight:800,color:c}}>{v}</div>
          </div>
        ))}
      </div>
    </div>}

    {tab==="shap"&&<div>
      <SLabel>Feature Attribution · Shapley Values</SLabel>
      {x.shap.map(([feat,val],i)=>(
        <div key={feat} style={{marginBottom:11}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
            <span style={{fontSize:11,color:DS.t2}}>{feat}</span>
            <span style={{fontSize:11,fontWeight:700,color:cols[i]}}>{(val*100).toFixed(0)}%</span>
          </div>
          <MiniBar v={val*100} col={cols[i]}/>
        </div>
      ))}
      <div style={{marginTop:10,background:DS.bg3,borderRadius:7,padding:"8px 10px",
        fontSize:10,color:DS.t3}}>Sum: {x.shap.reduce((a,[,v])=>a+v,0).toFixed(2)} · TreeExplainer</div>
    </div>}

    {tab==="lime"&&<div>
      <SLabel>LIME · Human-Readable Explanation</SLabel>
      <div style={{background:`${DS.cyan}09`,border:`1px solid ${DS.cyan}22`,borderRadius:8,
        padding:"12px 14px",marginBottom:12}}>
        <div style={{fontSize:12,color:DS.t2,lineHeight:1.9,fontStyle:"italic"}}>"{x.lime}"</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[["Locality","±45px neighborhood",DS.sky],["Samples","5,000 perturbations",DS.green],["Fidelity","R²=0.91",DS.amber],["Features","8 active",DS.violet]].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",
            background:DS.bg3,borderRadius:6,padding:"7px 10px"}}>
            <span style={{fontSize:10,color:DS.t3}}>{l}</span>
            <span style={{fontSize:10,fontWeight:700,color:c}}>{v}</span>
          </div>
        ))}
      </div>
    </div>}

    {tab==="cons"&&<div>
      <SLabel>Ensemble Model Consensus</SLabel>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[
          ["Vision Transformer","ViT-L/16",98.3,DS.cyan,true],
          ["Swin Transformer","Swin-B",97.1,DS.teal,true],
          ["EfficientNetV2","EfficientV2-L",96.8,DS.sky,true],
          ["ResNet152","ResNet-152",93.7,DS.green,false],
          ["DenseNet201","DenseNet-201",92.1,DS.t2,false],
        ].map(([name,arch,acc,col,agree])=>(
          <div key={name} style={{display:"flex",alignItems:"center",gap:8,
            background:agree?`${col}0C`:DS.bg3,borderRadius:7,padding:"8px 10px",
            border:`1px solid ${agree?col+"30":DS.b1}`}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:agree?col:DS.t4,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,fontWeight:700,color:agree?col:DS.t3,
                whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
              <div style={{fontSize:9,color:DS.t4}}>{arch} · {acc}%</div>
            </div>
            <Badge label={agree?"Agree":"Abstain"} col={agree?col:DS.t4} sm/>
          </div>
        ))}
      </div>
      <div style={{marginTop:12,background:`${DS.green}12`,border:`1px solid ${DS.green}30`,
        borderRadius:7,padding:"9px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,color:DS.t2}}>Ensemble vote</span>
        <span style={{fontSize:13,fontWeight:800,color:DS.green}}>3/5 agree · High</span>
      </div>
    </div>}
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  PIPELINE VISUALIZER
// ════════════════════════════════════════════════════════════════════════════
function PipelineViz({stage,pct}){
  const done=i=>i<stage;
  const active=i=>i===stage;
  return <div style={{display:"flex",alignItems:"flex-start",gap:0,overflowX:"auto",paddingBottom:4}}>
    {PIPELINE.map((s,i)=>(
      <div key={s.id} style={{display:"flex",alignItems:"flex-start",flex:1,minWidth:0}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1,minWidth:0}}>
          <div style={{width:34,height:34,borderRadius:"50%",display:"flex",alignItems:"center",
            justifyContent:"center",fontSize:13,flexShrink:0,transition:"all .4s",
            background:done(i)?DS.teal:active(i)?DS.cyan:DS.bg3,
            border:`2px solid ${done(i)?DS.teal:active(i)?DS.cyan:DS.b2}`,
            boxShadow:active(i)?`0 0 16px ${DS.cyan}60`:done(i)?`0 0 8px ${DS.teal}40`:"none"}}>
            {done(i)
              ?<span style={{color:"#000",fontWeight:800,fontSize:12}}>✓</span>
              :<span style={{opacity:active(i)?1:.35}}>{s.icon}</span>}
          </div>
          <div style={{fontSize:8.5,textAlign:"center",color:active(i)?DS.cyan:done(i)?DS.teal:DS.t4,
            marginTop:4,fontWeight:active(i)||done(i)?700:400,lineHeight:1.3,padding:"0 2px"}}>
            {s.label}
          </div>
          {active(i)&&pct<100&&<div style={{width:"80%",marginTop:3}}>
            <MiniBar v={(pct%(100/PIPELINE.length))*PIPELINE.length} col={DS.cyan} h={2}/>
          </div>}
        </div>
        {i<PIPELINE.length-1&&<div style={{height:2,flex:.4,marginTop:15,minWidth:6,
          background:done(i)?DS.teal:DS.b1,transition:"background .4s"}}/>}
      </div>
    ))}
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  TAB: AI ANALYSIS
// ════════════════════════════════════════════════════════════════════════════
function AnalysisTab(){
  const [mod,   setMod]   = useState(MODALITIES[0]);
  const [cond,  setCond]  = useState(MODALITIES[0].conditions[0]);
  const [selM,  setSelM]  = useState(["vit","swin","effnet"]);
  const [running,setRun]  = useState(false);
  const [stgI,  setStgI]  = useState(-1);
  const [pct,   setPct]   = useState(0);
  const [done,  setDone]  = useState(false);
  const [report,setRpt]   = useState(null);
  const [rptL,  setRptL]  = useState(false);
  const [fname, setFname] = useState(null);
  const [drag,  setDrag]  = useState(false);
  const fileRef = useRef();

  const pm = MODELS.find(m=>m.id===selM[0])||MODELS[0];
  const conf = (pm.acc - Math.random()*1.6).toFixed(1);
  const rc = riskMeta(cond.sev);

  const toggleM = id => setSelM(p=>p.includes(id)?(p.length>1?p.filter(x=>x!==id):p):[...p,id]);
  const handleMod = m => { setMod(m); setCond(m.conditions[0]); setDone(false); setRpt(null); setStgI(-1); setPct(0); setSelM([m.models[0], m.models[1]||m.models[0]]); };

  const runAnalysis = () => {
    setRun(true); setDone(false); setPct(0); setStgI(0); setRpt(null);
    let p=0, si=0;
    const iv = setInterval(()=>{
      p += (Math.random()*8+3);
      const nsi = Math.floor(p/(100/PIPELINE.length));
      if(nsi!==si&&nsi<PIPELINE.length){ si=nsi; setStgI(si); }
      if(p>=100){ clearInterval(iv); setRun(false); setDone(true); setPct(100); setStgI(PIPELINE.length); }
      else setPct(Math.min(p,99));
    }, 310);
  };

  const genReport = async () => {
    setRptL(true);
    try{
      const r = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:1200,
          messages:[{role:"user",content:
`You are a senior consultant radiologist AI at a tertiary hospital. Write a structured FHIR-compatible radiology report.

STUDY DETAILS:
• Modality: ${mod.label}
• ICD-10: ${cond.icd}
• AI Primary Finding: ${cond.name}
• AI Confidence: ${conf}%
• Risk: ${cond.sev}
• Models: ${selM.map(id=>MODELS.find(m=>m.id===id)?.name).join(", ")}
• Grad-CAM Region: ${XAI[cond.name]?.gcam||"Region of interest identified"}
• SHAP Features: ${XAI[cond.name]?.shap?.map(([f])=>f).join(", ")||""}
• LIME: ${XAI[cond.name]?.lime||""}

Write report with EXACTLY these section labels (ALL CAPS, colon):

CLINICAL INDICATION:
TECHNIQUE:
COMPARISON:
FINDINGS:
IMPRESSION:
RECOMMENDATION:
PRIORITY:
REPORTING RADIOLOGIST: AI-Assisted · ${pm.name} · Awaiting Consultant Sign-off

2-3 sentences per section. Precise anatomical and radiological terminology. Reference AI confidence and Grad-CAM findings. Clinical document format.`}]
        })
      });
      const d = await r.json();
      setRpt(d.content?.[0]?.text||"Report generation failed.");
    }catch{ setRpt("API connection error. Ensure API access is configured."); }
    setRptL(false);
  };

  return <div style={{display:"grid",gridTemplateColumns:"250px 1fr 268px",gap:14}}>
    <div style={{gridColumn:"1 / -1"}}><SafetyNotice/></div>
    {/* LEFT PANEL */}
    <div style={{display:"flex",flexDirection:"column",gap:10,overflowY:"auto",maxHeight:"calc(100vh - 90px)"}}>
      <Card style={{padding:14}}>
        <SLabel>Modality</SLabel>
        {MODALITIES.map(m=>(
          <button key={m.id} onClick={()=>handleMod(m)} style={{
            display:"flex",alignItems:"center",gap:9,padding:"9px 10px",width:"100%",
            background:mod.id===m.id?`${m.col}12`:"transparent",
            border:`1px solid ${mod.id===m.id?m.col:DS.b2}`,borderRadius:7,
            cursor:"pointer",textAlign:"left",marginBottom:4,transition:"all .15s"}}>
            <span style={{fontSize:19}}>{m.icon}</span>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:mod.id===m.id?m.col:DS.t1}}>{m.label}</div>
              <div style={{fontSize:9,color:DS.t3}}>{m.conditions.length} conditions · {m.models.length} models</div>
            </div>
          </button>
        ))}
      </Card>

      <Card style={{padding:14}}>
        <SLabel>Target Condition</SLabel>
        {mod.conditions.map(c=>(
          <button key={c.name} onClick={()=>setCond(c)} style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"8px 10px",width:"100%",
            background:cond.name===c.name?`${DS.violet}12`:"transparent",
            border:`1px solid ${cond.name===c.name?DS.violet:DS.b2}`,
            borderRadius:6,cursor:"pointer",marginBottom:4,transition:"all .15s"}}>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:11,fontWeight:700,color:cond.name===c.name?DS.violet:DS.t1}}>{c.name}</div>
              <div style={{fontSize:9,color:DS.t4}}>{c.icd} · {c.prev}% prevalence</div>
            </div>
            <Badge label={c.sev} col={riskMeta(c.sev).dot} sm/>
          </button>
        ))}
      </Card>

      <Card style={{padding:14}}>
        <SLabel>{`Models · ${selM.length} active`}</SLabel>
        {MODELS.filter(m=>mod.models.includes(m.id)).map(m=>{
          const sel = selM.includes(m.id);
          return <button key={m.id} onClick={()=>toggleM(m.id)} style={{
            display:"flex",alignItems:"center",gap:8,padding:"8px 10px",width:"100%",
            background:sel?`${m.col}10`:"transparent",
            border:`1px solid ${sel?m.col:DS.b2}`,borderRadius:6,
            cursor:"pointer",marginBottom:4,textAlign:"left",transition:"all .15s"}}>
            <div style={{width:13,height:13,borderRadius:3,flexShrink:0,
              background:sel?m.col:"transparent",border:`2px solid ${sel?m.col:DS.b3}`,
              display:"flex",alignItems:"center",justifyContent:"center"}}>
              {sel&&<span style={{color:"#000",fontSize:8,fontWeight:800}}>✓</span>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:10,fontWeight:700,color:sel?m.col:DS.t1,
                whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.name}</div>
              <div style={{fontSize:9,color:DS.t3}}>{m.acc}% · {m.spd} · {m.p}</div>
            </div>
            <Badge label={m.badge} col={m.col} sm/>
          </button>;
        })}
      </Card>

      <div onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)setFname(f.name);}}
        onClick={()=>fileRef.current?.click()}
        style={{border:`2px dashed ${drag?DS.cyan:DS.b2}`,borderRadius:10,
          padding:"18px 12px",textAlign:"center",cursor:"pointer",
          background:drag?`${DS.cyan}07`:"transparent",transition:"all .2s"}}>
        <input ref={fileRef} type="file" accept="image/*,.dcm,.nii,.nii.gz"
          style={{display:"none"}} onChange={e=>{if(e.target.files[0])setFname(e.target.files[0].name);}}/>
        <div style={{fontSize:24,marginBottom:5}}>🩻</div>
        <div style={{fontSize:11,fontWeight:600,color:fname?DS.cyan:DS.t3}}>
          {fname||"Drop DICOM / image here"}
        </div>
        <div style={{fontSize:9,color:DS.t4,marginTop:3}}>DCM · PNG · JPEG · NIfTI</div>
      </div>

      <button onClick={runAnalysis} disabled={running} style={{
        background:running?DS.bg3:DS.cyan,color:running?DS.t3:"#000A14",
        border:"none",borderRadius:10,padding:"13px 0",fontSize:13,fontWeight:800,
        cursor:running?"not-allowed":"pointer",transition:"all .2s",
        boxShadow:running?"none":`0 0 22px ${DS.cyan}35`}}>
        {running?`${PIPELINE[Math.min(stgI,PIPELINE.length-1)]?.label||"Processing"}…`:"▶  Run Analysis"}
      </button>
      {running&&<MiniBar v={pct} col={DS.cyan} h={3}/>}
    </div>

    {/* CENTER PANEL */}
    <div style={{display:"flex",flexDirection:"column",gap:12,minWidth:0,
      overflowY:"auto",maxHeight:"calc(100vh - 90px)"}}>

      {(running||done)&&<Card style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontSize:9,fontWeight:700,color:DS.t4,textTransform:"uppercase",letterSpacing:".1em"}}>
            Processing Pipeline
          </span>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {done&&<Badge label="Complete" col={DS.teal}/>}
            {running&&<span style={{fontSize:10,color:DS.cyan,fontFamily:"monospace"}}>{pct.toFixed(0)}%</span>}
          </div>
        </div>
        <PipelineViz stage={stgI} pct={pct}/>
        {running&&stgI>=0&&stgI<PIPELINE.length&&
          <div style={{marginTop:9,fontSize:10,color:DS.t3,textAlign:"center"}}>{PIPELINE[stgI].desc}</div>}
      </Card>}

      <Card style={{padding:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{mod.icon}</span>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:DS.t1}}>{mod.label}</div>
              <div style={{fontSize:10,color:DS.t3}}>{cond.name} · {cond.icd} · {cond.reg}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:5}}>
            <Badge label="DICOM" col={DS.indigo}/>
            {done&&<Badge label="AI Analysed" col={DS.cyan}/>}
            {done&&<Badge label={cond.sev} col={riskMeta(cond.sev).dot}/>}
          </div>
        </div>
        <DicomViewer modId={mod.id} condName={cond.name} conf={conf} gcam={done}/>
      </Card>

      {done&&<Card style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:24,fontWeight:900,color:DS.cyan,lineHeight:1,letterSpacing:"-.02em"}}>{cond.name}</div>
            <div style={{fontSize:11,color:DS.t3,marginTop:5}}>
              {selM.length}-model ensemble · {pm.name} primary · {conf}% confidence
            </div>
          </div>
          <div style={{background:rc.bg,border:`1px solid ${rc.bdr}`,borderRadius:9,
            padding:"10px 16px",textAlign:"center"}}>
            <div style={{fontSize:8,color:rc.tx,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",marginBottom:2}}>Risk Level</div>
            <div style={{fontSize:19,fontWeight:800,color:rc.tx}}>{cond.sev}</div>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:16}}>
          {[["Confidence",`${conf}%`,DS.cyan],["Precision",`${(pm.acc-.7).toFixed(1)}%`,DS.teal],
            ["Recall",`${(pm.acc-1.1).toFixed(1)}%`,DS.sky],["F1",pm.f1,DS.violet],
            ["AUC",pm.auc,DS.green],["Models",selM.length,DS.amber]].map(([l,v,c])=>(
            <div key={l} style={{background:DS.bg3,border:`1px solid ${DS.b2}`,borderRadius:7,padding:"9px",textAlign:"center"}}>
              <div style={{fontSize:8,color:DS.t4,textTransform:"uppercase",letterSpacing:".08em",marginBottom:3}}>{l}</div>
              <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>
          <div style={{background:`${DS.rose}0D`,border:`1px solid ${DS.rose}28`,borderRadius:7,padding:"10px 12px"}}>
            <div style={{fontSize:8,fontWeight:700,color:DS.roseL,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Priority Action</div>
            <div style={{fontSize:11,color:DS.t2}}>Review within {cond.sev==="Critical"?"2h":cond.sev==="High"?"12h":"48h"}</div>
          </div>
          <div style={{background:`${DS.indigo}0D`,border:`1px solid ${DS.indigo}28`,borderRadius:7,padding:"10px 12px"}}>
            <div style={{fontSize:8,fontWeight:700,color:DS.indigoL,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Key Differentials</div>
            {(XAI[cond.name]?.shap||[]).slice(0,2).map(([f])=>(
              <div key={f} style={{fontSize:10,color:DS.t2,marginBottom:1}}>· {f}</div>
            ))}
          </div>
          <div style={{background:`${DS.teal}0D`,border:`1px solid ${DS.teal}28`,borderRadius:7,padding:"10px 12px"}}>
            <div style={{fontSize:8,fontWeight:700,color:DS.teal,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>Ensemble Status</div>
            <div style={{fontSize:11,color:DS.t2}}>{selM.length}/{MODELS.filter(m=>mod.models.includes(m.id)).length} models active</div>
          </div>
        </div>

        <div style={{background:DS.bg3,border:`1px solid ${DS.b2}`,borderRadius:9,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:9,fontWeight:700,color:DS.t4,textTransform:"uppercase",letterSpacing:".1em"}}>
                AI Clinical Report · LLM Synthesis
              </div>
              {report&&<div style={{fontSize:9,color:DS.t4,marginTop:3}}>FHIR-compatible · Awaiting radiologist sign-off</div>}
            </div>
            <button onClick={genReport} disabled={rptL} style={{
              background:rptL?DS.bg3:`${DS.cyan}18`,color:rptL?DS.t3:DS.cyan,
              border:`1px solid ${rptL?DS.b1:DS.cyan}50`,borderRadius:7,
              padding:"5px 14px",fontSize:11,fontWeight:700,cursor:rptL?"not-allowed":"pointer"}}>
              {rptL?"⏳ Generating…":report?"↻ Regenerate":"✦ Generate Report"}
            </button>
          </div>
          {report
            ?<div style={{fontSize:11,color:DS.t2,lineHeight:2.1,whiteSpace:"pre-line",fontFamily:"'SF Mono',monospace"}}>{report}</div>
            :<div style={{fontSize:11,color:DS.t4,textAlign:"center",padding:"20px 0",fontStyle:"italic"}}>
              Click Generate Report for a full LLM-synthesized clinical radiology report
            </div>}
        </div>
      </Card>}

      {!done&&!running&&<Card style={{padding:"48px 0",textAlign:"center",border:`1px dashed ${DS.b2}`}}>
        <div style={{fontSize:38,opacity:.2,marginBottom:10}}>🔬</div>
        <div style={{fontSize:12,color:DS.t4}}>Configure modality, condition and models — then run analysis</div>
      </Card>}
    </div>

    {/* RIGHT: XAI */}
    <div style={{overflowY:"auto",maxHeight:"calc(100vh - 90px)"}}>
      <Card style={{padding:14}}>
        <SLabel>Explainable AI Engine</SLabel>
        {done
          ?<XaiPanel condName={cond.name}/>
          :<div style={{textAlign:"center",padding:"40px 0",color:DS.t4,fontSize:11}}>
            XAI activates after analysis
          </div>}
      </Card>
    </div>
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  TAB: ANALYTICS
// ════════════════════════════════════════════════════════════════════════════
function AnalyticsTab(){
  const [foc,setFoc]=useState("vit");
  const m=MODELS.find(x=>x.id===foc);
  const maxC=Math.max(...MONTHLY.map(x=>x.cases));
  const rocPts=[[0,0],[0.02,.52],[0.04,.72],[0.07,.84],[0.12,.91],[0.2,.95],[0.32,.97],[0.5,.99],[0.7,.995],[1,1]];
  const toXY=([x,y])=>[32+x*200,196-y*180];
  const rocD="M "+rocPts.map(p=>toXY(p).join(",")).join(" L ");
  const cm=[[Math.round(m.acc*.53),Math.round((100-m.acc)*.62)],[Math.round((100-m.acc)*.52),Math.round(m.acc*.47)]];
  const diseaseData=[
    {n:"Pneumonia",v:82,c:DS.cyan},{n:"COVID-19",v:71,c:DS.rose},
    {n:"Lung Nodules",v:67,c:DS.teal},{n:"Glioma",v:54,c:DS.violet},
    {n:"Diabetic Ret.",v:48,c:DS.amber},{n:"Stroke",v:38,c:DS.sky},
    {n:"Meningioma",v:34,c:DS.green},{n:"Pulm. Embolism",v:29,c:DS.indigoL},
  ];
  const maxD=Math.max(...diseaseData.map(d=>d.v));

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",gap:10}}>
      <Kpi label="Total Studies"     val="2,847" delta="+12.4%" icon="🩺" col={DS.cyan}/>
      <Kpi label="AI Accuracy"       val="96.8%" delta="+2.1%"  icon="🎯" col={DS.teal}/>
      <Kpi label="Avg Report Time"   val="1.4m"  delta="↓ 95%" icon="⚡" col={DS.green}/>
      <Kpi label="Critical Alerts"   val="23"    delta="+3 today" icon="🚨" col={DS.rose}/>
      <Kpi label="Models Deployed"   val="9"     icon="🧠"       col={DS.violet}/>
      <Kpi label="DICOM Studies"     val="14.2K" delta="↑ 847"  icon="💾" col={DS.sky}/>
      <Kpi label="Hours Saved"       val="847"   icon="⏱"       col={DS.amber}/>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr",gap:14}}>
      <Card style={{padding:16}}>
        <SLabel>Accuracy & Case Volume Trend</SLabel>
        <svg viewBox="0 0 300 175" width="100%">
          <line x1="32" y1="10" x2="32" y2="148" stroke={DS.b1} strokeWidth=".5"/>
          <line x1="32" y1="148" x2="295" y2="148" stroke={DS.b1} strokeWidth=".5"/>
          {[88,92,96,100].map((v)=><g key={v}>
            <line x1="30" y1={148-(v-84)*3.8} x2="295" y2={148-(v-84)*3.8}
              stroke={DS.b1} strokeWidth=".3" strokeDasharray="3 3"/>
            <text x="27" y={150-(v-84)*3.8} textAnchor="end" fontSize="6.5" fill={DS.t4}>{v}</text>
          </g>)}
          {MONTHLY.map((d,i)=>{
            const x=52+i*44, y=148-(d.acc-84)*3.8, bh=d.cases/maxC*62;
            return <g key={d.m}>
              <rect x={x-15} y={148-bh} width={30} height={bh} fill={`${DS.indigo}22`} rx="2"/>
              <circle cx={x} cy={y} r="3.5" fill={DS.cyan}/>
              <text x={x} y="160" textAnchor="middle" fontSize="7" fill={DS.t3}>{d.m}</text>
              <text x={x} y={y-6} textAnchor="middle" fontSize="5.5" fill={DS.cyanL}>{d.acc}%</text>
            </g>;
          })}
          <polyline fill="none" stroke={DS.cyan} strokeWidth="1.8" strokeLinejoin="round"
            points={MONTHLY.map((d,i)=>`${52+i*44},${148-(d.acc-84)*3.8}`).join(" ")}/>
        </svg>
      </Card>

      <Card style={{padding:16}}>
        <SLabel>Disease Distribution · Jun 2026</SLabel>
        {diseaseData.map(d=>(
          <div key={d.n} style={{marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:11,color:DS.t2}}>{d.n}</span>
              <span style={{fontSize:11,fontWeight:700,color:d.c}}>{d.v}</span>
            </div>
            <MiniBar v={d.v/maxD*100} col={d.c}/>
          </div>
        ))}
      </Card>

      <Card style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <SLabel style={{marginBottom:0}}>ROC Curve</SLabel>
          <span style={{fontSize:13,fontWeight:800,color:m.col}}>AUC {m.auc}</span>
        </div>
        <svg viewBox="0 0 248 215" width="100%">
          <line x1="32" y1="16" x2="32" y2="196" stroke={DS.b1} strokeWidth=".5"/>
          <line x1="32" y1="196" x2="232" y2="196" stroke={DS.b1} strokeWidth=".5"/>
          <line x1="32" y1="196" x2="232" y2="16" stroke={DS.b1} strokeWidth=".5" strokeDasharray="4 3"/>
          {[0,.5,1].map((v,i)=><g key={v}>
            <text x={32+i*100} y="208" textAnchor="middle" fontSize="7.5" fill={DS.t4}>{v}</text>
            <text x="28" y={196-i*90} textAnchor="end" fontSize="7.5" fill={DS.t4} dominantBaseline="middle">{v}</text>
          </g>)}
          <path d={rocD} fill="none" stroke={m.col} strokeWidth="2.2" strokeLinecap="round"/>
          <path d={rocD+" L 232,196 L 32,196 Z"} fill={m.col} fillOpacity=".07"/>
          <text x="132" y="223" textAnchor="middle" fontSize="7" fill={DS.t4}>False positive rate</text>
        </svg>
      </Card>
    </div>

    <Card style={{padding:16}}>
      <SLabel>Full Model Benchmark · Click Row to Focus ROC</SLabel>
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr>
              {["","Model","Architecture","Type","Accuracy","F1","AUC","Params","Inference","Badge"].map(h=>(
                <th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:9,fontWeight:700,
                  color:DS.t4,textTransform:"uppercase",letterSpacing:".07em",
                  borderBottom:`1px solid ${DS.b1}`,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MODELS.map(mod=>(
              <tr key={mod.id} onClick={()=>setFoc(mod.id)}
                style={{borderBottom:`1px solid ${DS.b2}`,cursor:"pointer",
                  background:foc===mod.id?`${mod.col}0C`:"transparent",transition:"background .15s"}}>
                <td style={{padding:"10px 12px"}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:mod.col,
                    boxShadow:`0 0 6px ${mod.col}80`}}/>
                </td>
                <td style={{padding:"10px 12px",fontWeight:700,color:foc===mod.id?mod.col:DS.t1,whiteSpace:"nowrap"}}>{mod.name}</td>
                <td style={{padding:"10px 12px",color:DS.t2,fontFamily:"monospace",fontSize:10}}>{mod.short}</td>
                <td style={{padding:"10px 12px"}}><Badge label={mod.type} col={mod.col} sm/></td>
                <td style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:66,background:DS.b1,borderRadius:99,height:5,overflow:"hidden"}}>
                      <div style={{width:`${mod.acc}%`,background:mod.col,height:5,borderRadius:99}}/>
                    </div>
                    <span style={{color:mod.col,fontWeight:800}}>{mod.acc}%</span>
                  </div>
                </td>
                <td style={{padding:"10px 12px",color:DS.t1,fontWeight:700}}>{mod.f1}</td>
                <td style={{padding:"10px 12px",color:DS.t1,fontWeight:700}}>{mod.auc}</td>
                <td style={{padding:"10px 12px",color:DS.t2}}>{mod.p}</td>
                <td style={{padding:"10px 12px",color:DS.t2}}>{mod.spd}</td>
                <td style={{padding:"10px 12px"}}><Badge label={mod.badge} col={mod.col} sm/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"300px 1fr",gap:14}}>
      <Card style={{padding:16}}>
        <SLabel>{`Confusion Matrix · ${m.name}`}</SLabel>
        <div style={{display:"grid",gridTemplateColumns:"56px 1fr 1fr",gridTemplateRows:"22px 1fr 1fr",gap:5}}>
          <div/>
          {["Pred +","Pred −"].map(h=>(
            <div key={h} style={{fontSize:10,color:DS.t3,textAlign:"center",fontWeight:700}}>{h}</div>
          ))}
          {[[0,"Actual +"],[1,"Actual −"]].map(([r,lb])=>[
            <div key={lb} style={{fontSize:10,color:DS.t3,display:"flex",alignItems:"center",fontWeight:700}}>{lb}</div>,
            ...[0,1].map(c=>{const v=cm[r][c];const tp=(r===0&&c===0)||(r===1&&c===1);
              return <div key={c} style={{background:tp?`${m.col}15`:`${DS.rose}10`,
                border:`1.5px solid ${tp?m.col:DS.rose}40`,borderRadius:8,
                display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:14}}>
                <div style={{fontSize:22,fontWeight:800,color:tp?m.col:DS.rose}}>{v}</div>
                <div style={{fontSize:9,color:DS.t3}}>{["TP","FN","FP","TN"][r*2+c]}</div>
              </div>;
            })
          ])}
        </div>
      </Card>

      <Card style={{padding:16}}>
        <SLabel>Monthly Performance · Cases / Reports / Critical / Avg Time</SLabel>
        <div style={{display:"flex",gap:10}}>
          {MONTHLY.map(d=>(
            <div key={d.m} style={{flex:1,background:DS.bg3,border:`1px solid ${DS.b2}`,
              borderRadius:8,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontSize:10,fontWeight:700,color:DS.t3,marginBottom:8}}>{d.m}</div>
              <div style={{fontSize:20,fontWeight:800,color:DS.cyan}}>{d.cases}</div>
              <div style={{fontSize:9,color:DS.t4,marginBottom:6}}>studies</div>
              <div style={{marginBottom:4}}><MiniBar v={d.rep/d.cases*100} col={DS.teal} h={3}/></div>
              <div style={{fontSize:9,color:DS.teal,marginBottom:4}}>{d.rep} reports</div>
              <div style={{fontSize:9,color:DS.rose,marginBottom:4}}>{d.crit} critical</div>
              <div style={{fontSize:9,color:DS.amber}}>{d.time}m avg</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  TAB: WORKLIST / PACS
// ════════════════════════════════════════════════════════════════════════════
function WorklistTab(){
  const [sel,  setSel]   = useState(null);
  const [filt, setFilt]  = useState("All");
  const [srch, setSrch]  = useState("");
  const [sort, setSort]  = useState("priority");
  const [cpQ,  setCpQ]   = useState("");
  const [cpA,  setCpA]   = useState(null);
  const [cpL,  setCpL]   = useState(false);
  const [cpSug,setCpSug] = useState(true);

  const pt = sel ? PATIENTS.find(x=>x.id===sel) : null;

  const fltd = PATIENTS
    .filter(p=> filt==="All" || p.risk===filt || p.sts===filt || p.mod===filt)
    .filter(p=> !srch || p.name.toLowerCase().includes(srch.toLowerCase()) ||
      p.id.toLowerCase().includes(srch.toLowerCase()) ||
      p.cond.toLowerCase().includes(srch.toLowerCase()) ||
      p.ward.toLowerCase().includes(srch.toLowerCase()))
    .sort((a,b)=> sort==="priority"?a.pri-b.pri:sort==="conf"?b.conf-a.conf:
      sort==="date"?new Date(b.date)-new Date(a.date):a.name.localeCompare(b.name));

  const askCopilot = async (q) => {
    const query = q||cpQ;
    if(!query.trim()) return;
    setCpQ(query); setCpL(true); setCpA(null); setCpSug(false);
    try{
      const r = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:700,
          messages:[{role:"user",content:
`You are a radiology AI copilot for a hospital PACS system. Answer clinical queries about the worklist.

CURRENT WORKLIST (${PATIENTS.length} patients):
${PATIENTS.map(p=>`${p.id} | ${p.name} | ${p.age}${p.sex} | ${p.mod} | ${p.cond} | ${p.conf}% | ${p.risk} risk | ${p.sts} | ${p.ward} | Ref: ${p.ref} | Note: ${p.notes}`).join("\n")}

QUERY: ${query}

Respond clinically and concisely. Reference patient IDs. Prioritize critical cases. Be specific and actionable. Max 5 sentences.`}]
        })
      });
      const d = await r.json();
      setCpA(d.content?.[0]?.text||"No response.");
    }catch{ setCpA("Connection error."); }
    setCpL(false);
  };

  const SUGS = ["Show all critical cases","Which patients need review today?","Highest confidence findings?","Pending scans by ward","Urgent MRI cases?"];

  return <div style={{display:"grid",gridTemplateColumns:"1fr 360px",gap:14,alignItems:"start"}}>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Card style={{padding:14}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <div style={{width:28,height:28,background:`${DS.cyan}20`,border:`1px solid ${DS.cyan}40`,
            borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>✦</div>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:DS.cyan}}>Radiology AI Copilot</div>
            <div style={{fontSize:9,color:DS.t4}}>Natural language queries · Powered by Claude</div>
          </div>
          <Badge label="PROTOTYPE" col={DS.amber} sm/>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <input value={cpQ} onChange={e=>setCpQ(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&askCopilot()}
            placeholder='e.g. "Show all critical MRI cases" or "Patients pending review this week"'
            style={{flex:1,background:DS.bg3,border:`1px solid ${DS.b2}`,borderRadius:7,
              padding:"9px 12px",fontSize:12,color:DS.t1,outline:"none"}}/>
          <button onClick={()=>askCopilot()} disabled={cpL} style={{
            background:cpL?DS.bg3:DS.cyan,color:cpL?DS.t3:"#000A14",
            border:"none",borderRadius:7,padding:"9px 18px",
            fontSize:12,fontWeight:800,cursor:cpL?"not-allowed":"pointer"}}>
            {cpL?"…":"Ask"}
          </button>
        </div>
        {cpSug&&<div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {SUGS.map(s=>(
            <button key={s} onClick={()=>askCopilot(s)} style={{
              background:DS.bg3,border:`1px solid ${DS.b2}`,borderRadius:5,
              padding:"3px 9px",fontSize:10,color:DS.t3,cursor:"pointer"}}>
              {s}
            </button>
          ))}
        </div>}
        {cpA&&<div style={{marginTop:10,background:DS.bg3,border:`1px solid ${DS.b2}`,
          borderRadius:7,padding:"11px 13px",fontSize:12,color:DS.t2,lineHeight:1.8}}>
          {cpA}
        </div>}
      </Card>

      <div style={{display:"flex",gap:8}}>
        {[
          [`${PATIENTS.filter(p=>p.risk==="Critical").length} Critical`,DS.rose],
          [`${PATIENTS.filter(p=>p.sts==="Pending Review").length} Pending`,DS.amber],
          [`${PATIENTS.filter(p=>p.sts==="Reviewed").length} Reviewed`,DS.green],
          [`${PATIENTS.filter(p=>p.mod==="Brain MRI").length} MRI`,DS.violet],
          [`${PATIENTS.filter(p=>p.mod==="CT Scan").length} CT`,DS.teal],
        ].map(([l,c])=>(
          <div key={l} style={{flex:1,background:DS.s1,border:`1px solid ${c}25`,
            borderRadius:7,padding:"8px 10px",textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:700,color:c}}>{l}</div>
          </div>
        ))}
      </div>

      <Card style={{overflow:"hidden",padding:0}}>
        <div style={{padding:"10px 14px",borderBottom:`1px solid ${DS.b1}`,
          display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",background:DS.bg3}}>
          <input value={srch} onChange={e=>setSrch(e.target.value)}
            placeholder="Search name, ID, condition, ward…"
            style={{background:DS.s1,border:`1px solid ${DS.b2}`,borderRadius:6,
              padding:"6px 11px",fontSize:11,color:DS.t1,width:210,outline:"none"}}/>
          <div style={{display:"flex",gap:3,flexWrap:"wrap"}}>
            {["All","Critical","High","Medium","Pending Review","Reviewed","Reported"].map(f=>(
              <button key={f} onClick={()=>setFilt(f)} style={{
                padding:"4px 10px",borderRadius:20,fontSize:10,fontWeight:700,cursor:"pointer",
                background:filt===f?DS.cyan:"transparent",color:filt===f?"#000A14":DS.t3,
                border:`1px solid ${filt===f?DS.cyan:DS.b2}`,transition:"all .15s"}}>{f}</button>
            ))}
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            <select value={sort} onChange={e=>setSort(e.target.value)}
              style={{background:DS.s1,border:`1px solid ${DS.b2}`,borderRadius:5,
                padding:"4px 7px",fontSize:10,color:DS.t2,cursor:"pointer"}}>
              <option value="priority">Priority</option>
              <option value="conf">Confidence</option>
              <option value="date">Date</option>
              <option value="name">Name</option>
            </select>
            <span style={{fontSize:10,color:DS.t4}}>{fltd.length}/{PATIENTS.length}</span>
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
            <thead>
              <tr style={{background:DS.bg3}}>
                {["","ID","Patient","Age","Ward","Modality","Finding","Conf","Risk","Status","Date","Referring"].map(h=>(
                  <th key={h} style={{padding:"8px 11px",textAlign:"left",fontSize:9,fontWeight:700,
                    color:DS.t4,textTransform:"uppercase",letterSpacing:".06em",whiteSpace:"nowrap"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fltd.map(p=>{
                const rc=riskMeta(p.risk);
                return <tr key={p.id} onClick={()=>setSel(sel===p.id?null:p.id)}
                  style={{borderTop:`1px solid ${DS.b2}`,cursor:"pointer",
                    background:sel===p.id?`${DS.cyan}09`:"transparent",transition:"background .15s"}}>
                  <td style={{padding:"9px 8px 9px 12px"}}>
                    <div style={{width:7,height:7,borderRadius:"50%",
                      background:p.pri===1?DS.rose:p.pri===2?DS.amber:DS.t4,
                      boxShadow:p.pri===1?`0 0 6px ${DS.rose}`:"none"}}/>
                  </td>
                  <td style={{padding:"9px 11px",color:DS.cyan,fontWeight:700,fontFamily:"monospace",fontSize:10,whiteSpace:"nowrap"}}>{p.id}</td>
                  <td style={{padding:"9px 11px",fontWeight:700,color:DS.t1,whiteSpace:"nowrap"}}>{p.name}</td>
                  <td style={{padding:"9px 11px",color:DS.t2}}>{p.age}{p.sex}</td>
                  <td style={{padding:"9px 11px",color:DS.t3,fontSize:10,whiteSpace:"nowrap"}}>{p.ward}</td>
                  <td style={{padding:"9px 11px",color:DS.t2,fontSize:10,whiteSpace:"nowrap"}}>{p.mod}</td>
                  <td style={{padding:"9px 11px",fontWeight:600,color:DS.t1,whiteSpace:"nowrap"}}>{p.cond}</td>
                  <td style={{padding:"9px 11px",whiteSpace:"nowrap"}}>
                    <span style={{color:p.conf>90?DS.green:p.conf>80?DS.amber:DS.rose,fontWeight:800}}>{p.conf}%</span>
                  </td>
                  <td style={{padding:"9px 11px"}}>
                    <span style={{background:rc.bg,color:rc.tx,border:`1px solid ${rc.bdr}`,
                      borderRadius:20,padding:"2px 8px",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>{p.risk}</span>
                  </td>
                  <td style={{padding:"9px 11px",fontSize:10,fontWeight:600,color:statusCol(p.sts),whiteSpace:"nowrap"}}>{p.sts}</td>
                  <td style={{padding:"9px 11px",color:DS.t4,fontSize:10,whiteSpace:"nowrap"}}>{p.date}</td>
                  <td style={{padding:"9px 11px",color:DS.t3,fontSize:10,whiteSpace:"nowrap"}}>{p.ref}</td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    {pt?(
      <div style={{display:"flex",flexDirection:"column",gap:10,position:"sticky",top:70}}>
        <Card style={{padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div>
              <div style={{fontSize:16,fontWeight:800,color:DS.t1}}>{pt.name}</div>
              <div style={{fontSize:10,color:DS.t3,marginTop:2}}>{pt.id} · {pt.mrn} · {pt.blood}</div>
              <div style={{fontSize:10,color:DS.t4,marginTop:1}}>{pt.ward}</div>
            </div>
            {(()=>{const rc=riskMeta(pt.risk);return(
              <span style={{background:rc.bg,color:rc.tx,border:`1px solid ${rc.bdr}`,
                borderRadius:20,padding:"3px 11px",fontSize:10,fontWeight:700}}>{pt.risk}</span>
            );})()}
          </div>
          <DicomViewer modId={MODALITIES.find(m=>m.label===pt.mod)?.id||"xray"}
            condName={pt.cond} conf={pt.conf} gcam compact/>
          <div style={{marginTop:10,background:`${DS.amber}0C`,border:`1px solid ${DS.amber}25`,
            borderRadius:6,padding:"7px 10px"}}>
            <div style={{fontSize:9,color:DS.amber,fontWeight:700,textTransform:"uppercase",letterSpacing:".07em",marginBottom:2}}>Clinical Note</div>
            <div style={{fontSize:11,color:DS.t2}}>{pt.notes}</div>
          </div>
        </Card>
        <Card style={{padding:14}}>
          {[["Study",pt.study],["Modality",pt.mod],["DOB",pt.dob],
            ["Blood",pt.blood],["Finding",pt.cond],["Confidence",`${pt.conf}%`],
            ["Date",pt.date],["Referring",pt.ref],["Status",pt.sts]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",
              padding:"7px 0",borderBottom:`1px solid ${DS.b2}`}}>
              <span style={{fontSize:11,color:DS.t3}}>{k}</span>
              <span style={{fontSize:11,fontWeight:700,color:DS.t1}}>{v}</span>
            </div>
          ))}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginTop:12}}>
            <button style={{background:`${DS.cyan}15`,color:DS.cyan,border:`1px solid ${DS.cyan}40`,
              borderRadius:7,padding:"9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              Full PACS Study
            </button>
            <button style={{background:`${DS.violet}15`,color:DS.violetL,border:`1px solid ${DS.violet}40`,
              borderRadius:7,padding:"9px",fontSize:11,fontWeight:700,cursor:"pointer"}}>
              Export PDF
            </button>
          </div>
        </Card>
      </div>
    ):(
      <Card style={{display:"flex",alignItems:"center",justifyContent:"center",
        flexDirection:"column",gap:10,padding:"70px 0",border:`1px dashed ${DS.b2}`}}>
        <div style={{fontSize:34,opacity:.2}}>🩺</div>
        <div style={{fontSize:12,color:DS.t4}}>Select a study to view details</div>
      </Card>
    )}
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  TAB: SECURITY & AUDIT
// ════════════════════════════════════════════════════════════════════════════
function SecurityTab(){
  const [activeRole,setAR]=useState("Radiologist");
  const ROLES=[
    {name:"Radiologist",  col:DS.cyan,   icon:"👨‍⚕️",
     perms:["Read all DICOM studies","Approve / reject AI findings","Add annotations & measurements",
            "Override AI diagnosis","Access full patient history","Export signed HL7 reports",
            "Access all imaging modalities","Dictate voice reports","View XAI explanations"]},
    {name:"Clinician",    col:DS.teal,   icon:"🏥",
     perms:["View assigned patient studies","Read approved reports only","Request new imaging studies",
            "Add clinical notes","View assigned ward list","Limited modality access","Refer to specialist"]},
    {name:"Technician",   col:DS.violet, icon:"⚙️",
     perms:["Upload DICOM files to PACS","Tag and route studies","Trigger AI analysis runs",
            "View own upload history","Edit DICOM metadata","Worklist management","No report access"]},
    {name:"Administrator",col:DS.rose,   icon:"🔐",
     perms:["Manage all user accounts","Assign and revoke roles","View complete audit trail",
            "System configuration","Compliance reporting","DICOM router settings",
            "Emergency access override","Model deployment","Infrastructure monitoring"]},
  ];
  const role=ROLES.find(r=>r.name===activeRole);

  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      {ROLES.map(r=>(
        <button key={r.name} onClick={()=>setAR(r.name)} style={{
          background:activeRole===r.name?`${r.col}12`:DS.s1,
          border:`2px solid ${activeRole===r.name?r.col:DS.b1}`,
          borderRadius:12,padding:16,cursor:"pointer",textAlign:"left",
          transition:"all .2s",boxShadow:activeRole===r.name?`0 0 18px ${r.col}18`:"none"}}>
          <div style={{fontSize:24,marginBottom:9}}>{r.icon}</div>
          <div style={{fontSize:13,fontWeight:800,color:activeRole===r.name?r.col:DS.t1,marginBottom:6}}>{r.name}</div>
          <div style={{fontSize:9,color:DS.t4}}>{r.perms.length} permissions</div>
        </button>
      ))}
    </div>

    {role&&<Card style={{padding:16,border:`1px solid ${role.col}30`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <span style={{fontSize:22}}>{role.icon}</span>
        <div>
          <div style={{fontSize:14,fontWeight:800,color:role.col}}>{role.name}</div>
          <div style={{fontSize:10,color:DS.t4}}>Active permission set · {role.perms.length} permissions</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:7}}>
        {role.perms.map(p=>(
          <div key={p} style={{display:"flex",alignItems:"center",gap:7,
            background:DS.bg3,borderRadius:7,padding:"8px 11px"}}>
            <span style={{color:DS.green,fontWeight:800,fontSize:12,flexShrink:0}}>✓</span>
            <span style={{fontSize:11,color:DS.t2}}>{p}</span>
          </div>
        ))}
      </div>
    </Card>}

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <Card style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SLabel style={{marginBottom:0}}>Live Audit Trail</SLabel>
          <Badge label={`${AUDIT_LOGS.length} entries`} col={DS.cyan} sm/>
        </div>
        {AUDIT_LOGS.map((log,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"9px 0",
            borderTop:i?`1px solid ${DS.b2}`:"none",alignItems:"flex-start"}}>
            <span style={{fontSize:9.5,color:DS.t4,fontFamily:"monospace",minWidth:58,marginTop:1}}>{log.ts}</span>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:2}}>
                <span style={{fontSize:11,fontWeight:700,color:DS.t1}}>{log.user}</span>
                <Badge label={log.role} col={ROLES.find(r=>r.name===log.role)?.col||DS.t2} sm/>
                <Badge label={log.result} col={log.result==="Override"?DS.amber:DS.green} sm/>
              </div>
              <div style={{fontSize:10,color:DS.t3}}>
                {log.action} · <span style={{color:DS.cyan}}>{log.target}</span>
              </div>
              <div style={{fontSize:9,color:DS.t4,marginTop:1}}>{log.sid} · {log.ip}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card style={{padding:16}}>
        <SLabel>Security Compliance · 12/12 Active</SLabel>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {[
            ["AES-256 Encryption at Rest",       "All patient data, DICOM files, reports"],
            ["TLS 1.3 In Transit",               "All API calls, DICOM transfer, PACS comms"],
            ["OAuth2 + JWT Authentication",      "Access tokens 8h · Refresh tokens 30d"],
            ["Multi-Factor Authentication",      "TOTP enforced for all user accounts"],
            ["RBAC — 4 Roles / 28 Permissions",  "Least-privilege, audited quarterly"],
            ["HIPAA Compliance",                 "BAA signed · Last audit 2026-06-01"],
            ["GDPR Article 25 (PbD)",            "Privacy by design, EU region compliant"],
            ["DICOM TLS Encryption",             "DIMSE + STOW-RS + WADO-RS encrypted"],
            ["Audit Log Immutability",           "Append-only PostgreSQL + SHA-256 hash chain"],
            ["Intrusion Detection (IDS)",        "SIEM alerts, anomaly detection active"],
            ["Penetration Test",                 "Last pentest 2026-05-15 · No critical findings"],
            ["Backup & DR",                      "3-2-1 backup · RTO 4h · RPO 1h"],
          ].map(([label,note])=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
              background:DS.bg3,borderRadius:7,padding:"8px 12px"}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:DS.t1}}>{label}</div>
                <div style={{fontSize:9,color:DS.t4}}>{note}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:DS.green,
                  boxShadow:`0 0 6px ${DS.green}`}}/>
                <span style={{fontSize:10,color:DS.green,fontWeight:700}}>Active</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <Card style={{padding:16}}>
      <SLabel>Enterprise Technology Stack · Production Architecture</SLabel>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:9}}>
        {[
          ["Frontend","React + Vite · Tailwind",DS.cyan],
          ["Backend","FastAPI · Python 3.12",DS.teal],
          ["AI Framework","PyTorch + MONAI",DS.violet],
          ["Foundation AI","MedSAM + BioViL",DS.indigo],
          ["Database","PostgreSQL 16 · Redis",DS.sky],
          ["PACS","Orthanc · OHIF Viewer",DS.amber],
          ["Auth","OAuth2 · JWT · MFA",DS.green],
          ["Monitoring","Grafana · Prometheus",DS.rose],
          ["Storage","S3 · DICOM Object Store",DS.t2],
          ["CI/CD","GitHub Actions · ArgoCD",DS.cyan],
          ["Infra","Docker · Kubernetes",DS.teal],
          ["XAI","Grad-CAM · SHAP · LIME",DS.violet],
          ["Reporting","ReportLab · HL7 FHIR",DS.sky],
          ["DICOM","pydicom · SimpleITK",DS.amber],
          ["Segmentation","U-Net · nnU-Net · SAM",DS.rose],
          ["LLM","Claude API · MedPaLM2",DS.green],
          ["Networking","Nginx · Load Balancer",DS.t2],
          ["Compliance","HIPAA · GDPR · ISO27001",DS.indigo],
        ].map(([l,v,c])=>(
          <div key={l} style={{background:DS.bg3,border:`1px solid ${DS.b2}`,borderRadius:7,padding:"10px 11px"}}>
            <div style={{fontSize:8,color:DS.t4,textTransform:"uppercase",letterSpacing:".08em",marginBottom:4}}>{l}</div>
            <div style={{fontSize:10,fontWeight:700,color:c,lineHeight:1.4}}>{v}</div>
          </div>
        ))}
      </div>
    </Card>
  </div>;
}

// ════════════════════════════════════════════════════════════════════════════
//  ROOT APPLICATION
// ════════════════════════════════════════════════════════════════════════════
const TABS=[
  {id:"analysis", label:"AI Analysis",     icon:"🔬"},
  {id:"analytics",label:"Analytics",       icon:"📊"},
  {id:"worklist", label:"Worklist · PACS", icon:"📋"},
  {id:"biomedical",label:"Biomedical Ops",  icon:"⚙"},
  {id:"security", label:"Security · Audit",icon:"🔐"},
];

const PLATFORM_STATUS = {
  environment:"PROTOTYPE",
  data:"SIMULATED DATA",
  pacs:"NOT CONNECTED",
  inference:"NOT CONNECTED",
};

const EQUIPMENT = [
  {name:"CT Scanner · CT-01",type:"Imaging",status:"Operational",health:91,next:"18 days",risk:"Low",col:DS.teal},
  {name:"MRI · MR-02",type:"Imaging",status:"Operational",health:87,next:"26 days",risk:"Low",col:DS.cyan},
  {name:"X-Ray · XR-04",type:"Imaging",status:"Inspection due",health:76,next:"4 days",risk:"Medium",col:DS.amber},
  {name:"Ventilator Bank · ICU-A",type:"Life support",status:"Operational",health:94,next:"41 days",risk:"Low",col:DS.green},
  {name:"Infusion Pumps · Ward B",type:"Infusion",status:"Telemetry unavailable",health:null,next:"Not available",risk:"Unknown",col:DS.t3},
  {name:"Oxygen PSA Plant · O2-01",type:"Utilities",status:"Telemetry unavailable",health:null,next:"Not available",risk:"Unknown",col:DS.t3},
];

function ProvenanceBanner(){
  return <div role="note" style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",
    background:`${DS.amber}0D`,border:`1px solid ${DS.amber}30`,borderRadius:8,
    padding:"7px 11px",marginBottom:14,fontSize:10,color:DS.amberL}}>
    <span style={{fontWeight:800,letterSpacing:".08em"}}>PROTOTYPE · {PLATFORM_STATUS.data}</span>
    <span style={{color:DS.t3}}>Clinical decision support only. No live PACS, DICOMweb, model-serving, equipment telemetry, or validated clinical metrics are connected.</span>
  </div>;
}

function SafetyNotice(){
  return <div style={{background:`${DS.rose}0B`,border:`1px solid ${DS.rose}28`,borderLeft:`3px solid ${DS.rose}`,
    borderRadius:7,padding:"9px 11px",fontSize:10,color:DS.t2,lineHeight:1.6}}>
    <strong style={{color:DS.roseL}}>Human review required.</strong> NEXRAD·AI provides decision support and does not replace qualified clinical judgment, radiological interpretation, or professional diagnosis.
  </div>;
}

function BiomedicalOpsTab(){
  const connected=EQUIPMENT.filter(x=>x.health!==null);
  return <div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:12,flexWrap:"wrap"}}>
      <div>
        <div style={{fontSize:22,fontWeight:900,color:DS.t1}}>Biomedical Operations</div>
        <div style={{fontSize:11,color:DS.t3,marginTop:4}}>Equipment intelligence, maintenance readiness, and utility monitoring</div>
      </div>
      <Badge label="Telemetry NOT CONNECTED" col={DS.t3}/>
    </div>

    <div className="biomed-kpis" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
      <Kpi label="Tracked Assets" val={EQUIPMENT.length} delta="Registry only" icon="⚙" col={DS.cyan}/>
      <Kpi label="Known Health" val={`${connected.length}/${EQUIPMENT.length}`} delta="Telemetry partial" icon="♥" col={DS.teal}/>
      <Kpi label="Maintenance Due" val="1" delta="Inspection queue" icon="⌁" col={DS.amber}/>
      <Kpi label="Failure Model" val="N/A" delta="Not yet validated" icon="?" col={DS.t3}/>
    </div>

    <div className="biomed-columns" style={{display:"grid",gridTemplateColumns:"1.45fr 1fr",gap:14}}>
      <Card style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SLabel style={{marginBottom:0}}>Equipment Health Registry</SLabel>
          <Badge label="SIMULATED / PARTIAL" col={DS.amber} sm/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {EQUIPMENT.map(item=><div className="equipment-row" key={item.name} style={{display:"grid",gridTemplateColumns:"1.6fr .8fr 1fr .7fr",alignItems:"center",gap:10,
            background:DS.bg3,border:`1px solid ${DS.b2}`,borderRadius:7,padding:"9px 11px"}}>
            <div><div style={{fontSize:11,fontWeight:700,color:DS.t1}}>{item.name}</div><div style={{fontSize:9,color:DS.t4}}>{item.type} · {item.status}</div></div>
            <div style={{fontSize:13,fontWeight:800,color:item.health===null?DS.t3:item.col}}>{item.health===null?"N/A":`${item.health}/100`}</div>
            <div style={{fontSize:10,color:DS.t3}}>Next PPM<br/><strong style={{color:DS.t2}}>{item.next}</strong></div>
            <Badge label={item.risk} col={item.risk==="Low"?DS.green:item.risk==="Medium"?DS.amber:DS.t3} sm/>
          </div>)}
        </div>
      </Card>

      <Card style={{padding:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <SLabel style={{marginBottom:0}}>Oxygen System</SLabel>
          <Badge label="NOT CONNECTED" col={DS.t3} sm/>
        </div>
        <div style={{background:DS.bg3,border:`1px dashed ${DS.b2}`,borderRadius:8,padding:16,textAlign:"center",marginBottom:12}}>
          <div style={{fontSize:26,fontWeight:900,color:DS.t3}}>—</div>
          <div style={{fontSize:12,fontWeight:800,color:DS.t2}}>No live plant telemetry</div>
          <div style={{fontSize:10,color:DS.t4,marginTop:4}}>Purity, pressure, flow, PSA cycles, alarms, and power data require a secure adapter.</div>
        </div>
        {["Purity","Pressure","Flow","Compressor","Dryer","PSA","Risk"].map(label=><div key={label} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${DS.b2}`}}><span style={{fontSize:10,color:DS.t3}}>{label}</span><span style={{fontSize:10,fontWeight:700,color:DS.t3}}>NOT CONNECTED</span></div>)}
      </Card>
    </div>

    <Card style={{padding:16}}>
      <SLabel>Predictive Maintenance Architecture</SLabel>
      <div className="maintenance-stages" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
        {["Sensor adapter","Feature store","Risk scoring","Maintenance workflow"].map((label,i)=><div key={label} style={{background:DS.bg3,border:`1px solid ${DS.b2}`,borderRadius:7,padding:"11px 12px"}}><div style={{fontSize:9,color:DS.t4,textTransform:"uppercase",letterSpacing:".08em"}}>Stage {i+1}</div><div style={{fontSize:11,fontWeight:700,color:DS.t2,marginTop:4}}>{label}</div><div style={{fontSize:9,color:DS.t3,marginTop:5}}>Adapter contract ready · not connected</div></div>)}
      </div>
      <SafetyNotice/>
    </Card>
  </div>;
}

function FacilityPulse({crit,pend}){
  const metrics=[
    ["Throughput", "247 studies", "SIMULATED DATA", DS.cyan, "92%"],
    ["AI readiness", "9 / 9 registry", "Model registry only", DS.teal, "100%"],
    ["Care SLA", "N/A", "Not yet validated", DS.amber, "0%"],
  ];
  return <section style={{display:"grid",gridTemplateColumns:"1.35fr 1fr 1fr 1fr",gap:10,marginBottom:14}}>
    <div style={{background:`linear-gradient(135deg,${DS.s2},${DS.bg3})`,border:`1px solid ${DS.b3}`,
      borderRadius:12,padding:"16px 18px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",right:-24,top:-34,width:140,height:140,borderRadius:"50%",
        border:`1px solid ${DS.cyan}20`,boxShadow:`0 0 0 18px ${DS.cyan}08,0 0 0 36px ${DS.cyan}04`}}/>
      <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
        <span style={{width:7,height:7,borderRadius:"50%",background:DS.green,boxShadow:`0 0 9px ${DS.green}`}}/>
        <span style={{fontSize:9,fontWeight:800,letterSpacing:".13em",color:DS.green,textTransform:"uppercase"}}>Facility command</span>
      </div>
      <div style={{fontSize:20,fontWeight:900,color:DS.t1,letterSpacing:"-.02em"}}>Clinical imaging command center</div>
      <div style={{fontSize:10,color:DS.t2,marginTop:5}}>Synthetic facility scenario · 4 modality families</div>
      <div style={{display:"flex",gap:6,marginTop:12,flexWrap:"wrap"}}>
        <span style={{fontSize:9,color:DS.roseL,background:`${DS.rose}18`,border:`1px solid ${DS.rose}35`,borderRadius:5,padding:"4px 7px",fontWeight:700}}>{crit} critical queue</span>
        <span style={{fontSize:9,color:DS.amberL,background:`${DS.amber}15`,border:`1px solid ${DS.amber}30`,borderRadius:5,padding:"4px 7px",fontWeight:700}}>{pend} awaiting review</span>
      </div>
    </div>
    {metrics.map(([label,val,note,col,fill])=><div key={label} style={{background:DS.s1,border:`1px solid ${DS.b1}`,borderRadius:12,padding:"14px 15px",minWidth:0}}>
      <div style={{fontSize:9,color:DS.t3,fontWeight:800,letterSpacing:".1em",textTransform:"uppercase",marginBottom:9}}>{label}</div>
      <div style={{fontSize:18,fontWeight:850,color:col,whiteSpace:"nowrap"}}>{val}</div>
      <div style={{fontSize:9,color:DS.t3,marginTop:4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{note}</div>
      <div style={{height:3,background:DS.b1,borderRadius:99,marginTop:12,overflow:"hidden"}}><div style={{width:fill,height:"100%",background:col,borderRadius:99}}/></div>
    </div>)}
  </section>;
}

export default function App(){
  const [tab,setTab]=useState("analysis");
  const crit=PATIENTS.filter(p=>p.risk==="Critical").length;
  const pend=PATIENTS.filter(p=>p.sts==="Pending Review").length;

  return <div style={{fontFamily:"'Trebuchet MS','Segoe UI',sans-serif",
    background:`radial-gradient(circle at 90% 0%, ${DS.s2}45 0%, transparent 28%),${DS.bg0}`,
    minHeight:"100vh",color:DS.t1}}>

    <header style={{background:DS.bg1,borderBottom:`1px solid ${DS.b1}`,padding:"0 20px",
      display:"flex",alignItems:"center",gap:14,height:52,
      position:"sticky",top:0,zIndex:300}}>
      <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
        <div style={{width:34,height:34,background:`linear-gradient(135deg,${DS.cyan},${DS.indigo})`,
          borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:19,boxShadow:`0 0 18px ${DS.cyan}35`}}>🏥</div>
        <div>
          <div style={{fontSize:15,fontWeight:900,letterSpacing:"-.03em",color:DS.t1}}>
            NEXRAD<span style={{color:DS.cyan}}>·AI</span>
          </div>
          <div style={{fontSize:8,color:DS.t4,letterSpacing:".15em",textTransform:"uppercase"}}>
            Enterprise Clinical Imaging · v3.0
          </div>
        </div>
      </div>

      <nav className="primary-nav" style={{display:"flex",gap:2,marginLeft:12}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            display:"flex",alignItems:"center",gap:6,padding:"6px 13px",
            background:tab===t.id?`${DS.cyan}14`:"transparent",
            border:"none",borderBottom:tab===t.id?`2px solid ${DS.cyan}`:"2px solid transparent",
            borderRadius:"6px 6px 0 0",cursor:"pointer",fontSize:12,fontWeight:600,
            color:tab===t.id?DS.cyan:DS.t3,transition:"all .15s",marginBottom:"-1px"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      <div className="header-status" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
        {crit>0&&<div style={{display:"flex",alignItems:"center",gap:5,
          background:`${DS.rose}14`,border:`1px solid ${DS.rose}35`,borderRadius:7,padding:"4px 10px"}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:DS.rose,
            boxShadow:`0 0 7px ${DS.rose}`,animation:"pulse 2s infinite"}}/>
          <span style={{fontSize:9,color:DS.roseL,fontWeight:700}}>{crit} CRITICAL</span>
        </div>}
        {pend>0&&<div style={{display:"flex",alignItems:"center",gap:5,
          background:`${DS.amber}12`,border:`1px solid ${DS.amber}30`,borderRadius:7,padding:"4px 10px"}}>
          <span style={{fontSize:9,color:DS.amberL,fontWeight:700}}>{pend} PENDING</span>
        </div>}
        {[["Model registry",DS.teal],["PACS not connected",DS.indigo],["DICOM adapter",DS.sky]].map(([l,c])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:5,
            background:`${c}12`,border:`1px solid ${c}28`,borderRadius:6,padding:"3px 9px"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:c}}/>
            <span style={{fontSize:9,color:c,fontWeight:700}}>{l}</span>
          </div>
        ))}
        <div style={{display:"flex",alignItems:"center",gap:7,paddingLeft:8,borderLeft:`1px solid ${DS.b2}`}}>
          <div style={{width:30,height:30,
            background:`linear-gradient(135deg,${DS.indigo},${DS.violet})`,
            borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>👤</div>
          <div>
            <div style={{fontSize:11,fontWeight:700,color:DS.t1}}>Dr. Okonkwo</div>
            <div style={{fontSize:8.5,color:DS.t4}}>Radiologist · Senior · On shift</div>
          </div>
        </div>
      </div>
    </header>

    <main style={{padding:"16px 20px",maxWidth:1800,margin:"0 auto"}}>
      <FacilityPulse crit={crit} pend={pend}/>
      <ProvenanceBanner/>
      {tab==="analysis"  &&<AnalysisTab/>}
      {tab==="analytics" &&<AnalyticsTab/>}
      {tab==="worklist"  &&<WorklistTab/>}
      {tab==="biomedical"&&<BiomedicalOpsTab/>}
      {tab==="security"  &&<SecurityTab/>}
    </main>

    <style>{`
      *{box-sizing:border-box;margin:0;padding:0;}
      input::placeholder{color:${DS.t4};}
      select option{background:${DS.s1};color:${DS.t1};}
      ::-webkit-scrollbar{width:4px;height:4px;}
      ::-webkit-scrollbar-track{background:${DS.bg0};}
      ::-webkit-scrollbar-thumb{background:${DS.b2};border-radius:99px;}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
      @media(max-width:1100px){
        .header-status>div:nth-child(n+3){display:none!important;}
        .primary-nav{margin-left:0!important;}
      }
      @media(max-width:760px){
        header{height:auto!important;min-height:60px!important;padding:10px 12px!important;flex-wrap:wrap;}
        .primary-nav{order:3;width:100%;overflow-x:auto;padding-top:3px;}
        .primary-nav button{flex:0 0 auto;font-size:11px!important;padding:6px 9px!important;}
        .header-status{display:none!important;}
        main{padding:12px!important;}
        section{grid-template-columns:1fr 1fr!important;}
        section>div:first-child{grid-column:1 / -1;}
        .biomed-kpis{grid-template-columns:1fr 1fr!important;}
        .biomed-columns{grid-template-columns:1fr!important;}
        .equipment-row{grid-template-columns:1fr 1fr!important;}
        .maintenance-stages{grid-template-columns:1fr 1fr!important;}
      }
      @media(max-width:520px){
        section{grid-template-columns:1fr!important;}
        section>div:first-child{grid-column:auto;}
      }
    `}</style>
  </div>;
}
