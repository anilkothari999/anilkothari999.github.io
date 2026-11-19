
(()=>{
 'use strict';
 const cards=[...document.querySelectorAll('[data-calculator]')];
 const calcLinks=[...document.querySelectorAll('.calc-list a[href^="#"]')];
 const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0);
 const val=(card,name)=>{const el=card.querySelector(`[name="${name}"]`);return el?Number(el.value)||0:0};
 const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:0));
 let charts={};
 function showCalculator(id,scroll=false){let card=cards.find(c=>c.id===id||c.dataset.calculator===id);if(!card)card=cards[0];if(!card)return;
  cards.forEach(c=>c.classList.toggle('active',c===card));calcLinks.forEach(a=>{const on=a.getAttribute('href')==='#'+card.id;a.setAttribute('aria-current',on?'true':'false')});
  const activeLink=calcLinks.find(a=>a.getAttribute('aria-current')==='true');const list=activeLink?.parentElement;if(list&&list.scrollWidth>list.clientWidth)list.scrollLeft+=activeLink.getBoundingClientRect().left-list.getBoundingClientRect().left-16;
  if(scroll)card.scrollIntoView({behavior:'smooth',block:'start'});renderMetrics(card);renderFlatCompare(card);
 }
 function renderMetrics(card){const box=card.querySelector('[data-ff-metrics]');if(!box)return;const id=card.dataset.calculator;const result=Number(card.querySelector('[data-result]')?.textContent?.replace(/[^\d.-]/g,''))||0;const years=val(card,'years');const rate=val(card,'rate');let invested=0,final=result,labels=[['Investment / principal',0],['Tenure',years+' years'],['Expected annual rate',rate+'%'],['Estimated gain',0],['Estimated final amount',final]];
  if(id==='sip'){invested=val(card,'monthly')*years*12;labels[0]=['Total invested',invested];labels[3]=['Estimated gain',Math.max(0,final-invested)]}
  else if(id==='goal-sip'){invested=result*years*12;labels[0]=['Estimated total contributions',invested];labels[3]=['Estimated gain',Math.max(0,final-invested)];labels[4]=['Target amount',val(card,'target')]}
  else if(id==='smart-goal'){invested=val(card,'existing')+result*years*12;labels[0]=['Existing savings + contributions',invested];labels[3]=['Illustrative growth',Math.max(0,final-invested)]}
  else if(id==='inflation'){invested=val(card,'target');labels[0]=['Cost today',invested];labels[3]=['Estimated cost increase',Math.max(0,final-invested)];labels[4]=['Future cost',final]}
  else if(id==='cost-of-delay'){invested=val(card,'monthly')*12*years;labels[0]=['Contributions',invested];labels[3]=['Estimated growth',Math.max(0,final-invested)]}
  else if(id==='lumpsum'){invested=val(card,'principal');labels[0]=['Amount invested',invested];labels[3]=['Estimated gain',Math.max(0,final-invested)]}
  else if(id==='emi'){const p=val(card,'principal'),months=Math.max(1,Math.round(years*12));const r=rate/1200;const monthly=r===0?p/months:p*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);invested=p;final=monthly*months;labels=[['Loan principal',p],['Tenure',years+' years'],['Annual reducing rate',rate+'%'],['Total interest',Math.max(0,final-p)],['Total repayment',final]]}
  else if(id==='swp'){invested=val(card,'principal');labels[0]=['Starting corpus',invested];labels[3]=['Estimated remaining corpus',final];labels[4]=['Monthly withdrawal',val(card,'monthly')]}
  else {const principal=val(card,'principal')||val(card,'target')||val(card,'monthly')*years*12;invested=principal;labels[0]=['Amount / principal',invested];labels[3]=['Estimated difference',Math.max(0,final-invested)]}
  if(id!=='emi'&&result>0)labels=labels.filter(([,value])=>typeof value!=='number'||Math.round(value)!==Math.round(result));
  box.replaceChildren();labels.forEach(([label,value])=>{const item=document.createElement('div');item.className='ff-metric';const span=document.createElement('span');span.textContent=label;const strong=document.createElement('strong');strong.textContent=typeof value==='string'?value:money(value);item.append(span,strong);box.append(item)});
 }
 function renderFlatCompare(card){const panel=card.querySelector('[data-ff-flat-compare]'),summary=card.querySelector('[data-ff-compare-summary]');if(!panel)return;const isEmi=card.dataset.calculator==='emi';panel.hidden=!isEmi;if(summary)summary.hidden=!isEmi;if(!isEmi){card.querySelector('[data-generic-results]')?.removeAttribute('hidden');card.querySelector('[data-generic-chart]')?.removeAttribute('hidden');return}
  card.querySelector('[data-generic-results]')?.setAttribute('hidden','');card.querySelector('[data-generic-chart]')?.setAttribute('hidden','');
  const p=clamp(val(card,'principal'),0,1e12),years=clamp(val(card,'years'),0,40),months=Math.round(years*12),reducingRate=clamp(val(card,'rate'),0,100),flatRate=clamp(val(card,'flat'),0,100);
  const flatInterest=p*flatRate/100*years,flatRepay=p+flatInterest,flatMonthly=months?flatRepay/months:0;
  const r=reducingRate/1200,emi=months?(r===0?p/months:p*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1)):0,reducingRepay=emi*months,reducingInterest=Math.max(0,reducingRepay-p);
  const put=(sel,value)=>{const el=card.querySelector(sel);if(el)el.textContent=value};
  put('[data-flat-total]',money(flatRepay));put('[data-flat-principal]',money(p));put('[data-flat-rate]',flatRate+'%');put('[data-flat-interest]',money(flatInterest));put('[data-flat-repayment]',money(flatRepay));put('[data-flat-monthly]',money(flatMonthly));
  put('[data-reducing-total]',money(reducingRepay));put('[data-reducing-principal]',money(p));put('[data-reducing-rate]',reducingRate+'%');put('[data-reducing-interest]',money(reducingInterest));put('[data-reducing-repayment]',money(reducingRepay));put('[data-reducing-monthly]',money(emi));
  if(window.Chart){[['flat',p,flatInterest],['reducing',p,reducingInterest]].forEach(([key,principal,interest])=>{const canvas=card.querySelector(`[data-${key}-chart]`);if(!canvas)return;if(charts[key])charts[key].destroy();charts[key]=new Chart(canvas,{type:'doughnut',data:{labels:['Loan principal','Total interest'],datasets:[{data:[Math.max(0,principal),Math.max(0,interest)],backgroundColor:['#17315f','#e4b323'],borderWidth:1}]},options:{responsive:true,plugins:{legend:{position:'bottom'},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${money(ctx.raw)}`}}}}})})}
  if(summary){const diff=Math.abs(flatInterest-reducingInterest),cheaper=flatInterest<reducingInterest?'Flat-rate calculation':flatInterest>reducingInterest?'Reducing-balance calculation':'Both calculations';summary.textContent=`Interest difference: ${money(diff)}. ${cheaper} results in lower total interest for these inputs. This is an illustrative mathematical comparison; lender fees, schedules and terms may change actual costs.`}
 }
 calcLinks.forEach(a=>a.addEventListener('click',()=>{const id=a.getAttribute('href').slice(1);setTimeout(()=>showCalculator(id,true),0)}));
 cards.forEach(card=>{card.querySelectorAll('[data-calc-input]').forEach(input=>input.addEventListener('input',()=>{setTimeout(()=>{renderMetrics(card);renderFlatCompare(card)},0)}));card.querySelector('[data-reset]')?.addEventListener('click',()=>setTimeout(()=>{renderMetrics(card);renderFlatCompare(card)},0))});
 function fromHash(){const raw=decodeURIComponent(location.hash.slice(1)||'');const parts=raw.split('--');if(parts[0]==='calculators'&&parts[1])showCalculator(parts.slice(1).join('--'));else if(parts[0]==='calculators')showCalculator('sip');else if(cards.some(c=>c.id===raw||c.dataset.calculator===raw))showCalculator(raw)}
 window.addEventListener('hashchange',fromHash);fromHash();if(!cards.some(c=>c.classList.contains('active')))showCalculator('sip');
})();
