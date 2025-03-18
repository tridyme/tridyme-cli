
// import regression from 'regression';
// import Mathematic from "../General/Mathematic";
// import { AssignmentIndSharp } from '@material-ui/icons';

// class functions {
//   constructor(data){
//     this.data = data;
//     this.mathematic = new Mathematic();
//   }


//   d() {
//     const h = this.data.h.value;
//     const c = this.data.c.value;
//     return h - c;
//   }

//   dPrime() {
//     const cPrime = this.data.cPrime.value;
//     return cPrime;
//   }

//   fcm(){
//     const fck = this.data.fck.value;
//     return  fck + 8;
//   }

//   fcd() {
//     const fck = this.data.fck.value;
//     const alphacc = this.data.alphacc.value;
//     const gammac = this.data.gammac.value;
//     return  alphacc * fck / gammac;
//   }

//   fctm() {
//     const fck = this.data.fck.value;
//     let value = 0;
//     if (fck > 50) {
//       value = 2.12 * Math.log(1 + (fck + 8) / 10);
//     } else {
//       value = 0.3 * fck ** (2 / 3);
//     }
//     return value
//   }

//   fyd() {
//     const fyk = this.data.fyk.value;
//     const gammas = this.data.gammas.value;
//     return fyk / gammas;
//   }

//   AsMin() {
//     const b = this.data.b.value;
//     const fyk = this.data.fyk.value;
//     const fctm = this.fctm();
//     const d = this.d();
//     let value = Math.max(0.26 * b * d * fctm / fyk, 0.0013 * b * d) * 10000;
//     return value;
//   }

//   AsMax() {
//     const b = this.data.b.value;
//     const h = this.data.h.value;
//     let value = 0.04 * b * h * 10000;
//     return value;
//   }

//   Meq() {
//     const Med = this.data.Med.value;
//     const Ned = this.data.Ned.value;
//     const d = this.data.d.value;
//     const h = this.data.h.value;
//     let emin = 0;
//     if (Ned > 0) {
//       emin = Math.max(20 * 0.001, h / 30);
//     }
//     const value = Math.abs(Med) + (Ned * ((d - h / 2) + emin)); // Attention signe moment
//     return value;
//   }

//   mud() {
//     const Ned = this.data.Ned.value;
//     const Med = this.data.Med.value;
//     const b = this.data.b.value;
//     const c = this.data.c.value;
//     const cPrime = this.data.cPrime.value;
//     const h = this.data.h.value;
//     const fcd = this.fcd();
//     const Meq = this.Meq();
  
//     const d = h - c;
//     const dPrime = cPrime;
  
//     let  mud;
//     if (Med >= -0.01 && Med <= 0.01 ) {
//       mud = "--";
//     } else {
//       // Vérification de la section entièrement ou partiellement tendue
//       if (Ned < 0) {
//         let eged = Med / Ned;
//         let DD;
        
//         if (eged < 0) {
//           DD = h / 2 - d;
//         } else {
//           DD = h / 2 - dPrime;
//         }    
//         if (Math.abs(eged) > Math.abs(DD)) {
//           // Section partiellement tendue
//           mud = (Meq * 0.001) / (fcd * b * (d ** 2)); // Corrigé Meq en Med
//         } else {
//           // Section entièrement tendue
//           mud = "--";
//         }
//       } else  { 
//         mud = (Meq * 0.001) / (fcd * b * (d ** 2)); 
//       }
//     }
//     return mud; //  { cas, value }; // Retourner les résultats
//   }
  
//   cas() {
//     const Ned = this.data.Ned.value;
//     const Med = this.data.Med.value;
//     const c = this.data.c.value;
//     const cPrime = this.data.cPrime.value;
//     const h = this.data.h.value;


//     const d = h - c;
//     const dPrime = cPrime;
  
//     let cas
//     // Vérification de la section entièrement ou partiellement tendue
//     if (Ned < 0) {
//       let eged = Med / Ned;
//       let DD;       
//       if (eged < 0) {
//         DD = h / 2 - d;
//       } else {
//         DD = h / 2 - dPrime;
//       }
//       if (Math.abs(eged) > Math.abs(DD)) {
//         // Section partiellement tendue
//         cas = "section partiellement tendue";
//       } else {
//         // Section entièrement tendue
//         cas = "section entièrement tendue";
//       }
//     } else {
//       cas = "Ned non négatif";
//     }

//     return cas; //  { cas, value }; // Retourner les résultats
//   }

//   alphau() {
//     const mud = this.mud();
//     let value;
//     if (mud === "--"){
//       value = "--";
//     } else {
//     value = 1.25 * (1 - (1 - 2 * mud) ** (0.5));
//     }
//     return value;
//   }

//   zu() {
//     const alphau = this.alphau();
//     const mud = this.mud();
//     let value;
//     const d = this.d();
  
//     if (mud === "--") {
//       value = "--";
//     } else {
//       const xx = alphau * d;
//       value = d - 0.4 * xx;
//     }
  
//     return value;
//   }

//   sigmaS() {
//     const E = this.data.E.value;
//     const mud = this.mud();
//     const d = this.d();
//     const fyd = this.fyd();

//     let epsilons;
//     let value;


//     if (mud === "--"){ //Section entiérement tendue
//       value = fyd;
//     } else {
//       if (mud <= 0.056) { // Pivot A
//         epsilons = 45;
//         value = Math.min((epsilons * E) / 1000, fyd);
//       } else if (mud > 0.056 && mud <= 0.372) { // Pivot B
//         var epsilonc = 3.5;
//         var alphau = this.alphau();
//         var xx = alphau * d;
//         epsilons = (epsilonc * (d - xx)) / xx;
//         value = Math.min((epsilons * E) / 1000, fyd);
//       } else { // Pivot D //Aciers comprimées
//         value = fyd;
//       }
//     }    
//     return value;
//   }  
    
//   AsInf() {
//     const mud = this.mud();
//     const Ned = this.data.Ned.value;
//     const Med = this.data.Med.value;
//     const b = this.data.b.value;
//     const h = this.data.h.value;
//     const fcd = this.fcd();
//     const fyd = this.fyd();
//     const Meq = this.Meq();
//     const cas = this.cas();
//     const AsMax = this.AsMax();
//     var d = this.d();
//     const dPrime = this.dPrime();
//     const zu = this.zu();
//     // const AsMin = this.AsMin();
//     const sigmaS = this.sigmaS();
//     let AsInf;

//     if (Med >= -0.01 && Med <= 0.01 ) {
//       AsInf = "--" ;
//     } else {  
//       if (cas === "section entièrement tendue") {
//         var ea = (d - 0.5 * h) + (Med / Ned);
//         var As1 = (-Ned * ea * 10) / (fyd * (d - dPrime));
//         var As2 = (Ned * 10 / fyd) * ((ea / (d - dPrime)) - 1);

//         if (Med > 0) {
//           AsInf = As2;
//         } else {
//           AsInf = As1;
//         }
//       } else {
//         let AsCalcul;
    
//         if (mud <= 0.372) { // Pivot A ET B
//           AsCalcul = ((Meq * 10) / (zu * sigmaS)) - ((Ned * 0.001 * 10000) / sigmaS);
//           if (Med > 0) {
//               if (AsCalcul >= AsMax){
//                 AsInf = "--"; 
//               } else { 
//                 AsInf = AsCalcul;    
//               }
//           } else {
//             if (AsCalcul >= AsMax){
//               AsInf = "--";
//             } else { 
//               AsInf = 0;   
//             }
//           }
//         } else if (mud >= 0.372 && mud < 0.48) { // Pivot D
//           var Me_ud = 0.372 * b * (d ** 2) * fcd * 1000;
//           var xx = 0.617 * d;
//           var As_ud = Me_ud / (sigmaS * (d - 0.4 * xx)) * 10;
//           var As_c = (Meq - Me_ud) / (fyd * (d - dPrime)) * 10;
//           AsCalcul = As_ud + As_c;
          
//           if (Med > 0) {
//             if (AsCalcul >= AsMax){
//               AsInf = "--"; 
//             } else { 
//               AsInf = AsCalcul;    
//             }
//           } else {
//             if (AsCalcul >= AsMax){
//               AsInf = "--"; 
//             } else { 
//               AsInf = As_c;    
//             }
//           }
//         } else { // Section entièrement comprimée
//           AsInf = "--";
//         }
//       }
//     }
//     return AsInf;
//   }
    
//   AsSup() {
//     const mud = this.mud();
//     const Ned = this.data.Ned.value;
//     const Med = this.data.Med.value;
//     const b = this.data.b.value;
//     const h = this.data.h.value;
//     const fcd = this.fcd();
//     const fyd = this.fyd();
//     const Meq = this.Meq();
//     const cas = this.cas();
//     var d = this.d();
//     const dPrime = this.dPrime();
//     const zu = this.zu();
//     const AsMax = this.AsMax();
//     // const AsMin = this.AsMin();
//     const sigmaS = this.sigmaS();
//     let AsSup;

//     if (Med >= -0.01 && Med <= 0.01 ) {
//       AsSup = "--" ;
//     } else {
//       if (cas === "section entièrement tendue") {
//         var ea = (d - 0.5 * h) + (Med / Ned);
//         var As1 = (-Ned * ea * 10) / (fyd * (d - dPrime));
//         var As2 = (Ned * 10 / fyd) * ((ea / (d - dPrime)) - 1);

//         if (Med > 0) {
//           AsSup = As1;
//         } else {
//           AsSup = As2;
//         }
//       } else {
//         let AsCalcul;
    
//         if (mud <= 0.372) { // Pivot A ET B
//           AsCalcul = ((Meq * 10) / (zu * sigmaS)) - ((Ned * 0.001 * 10000) / sigmaS);
//           if (Med > 0) {
//             if (AsCalcul >= AsMax){
//               AsSup = "--"; 
//             } else { 
//               AsSup = 0;    
//             }
//           } else {
//             if (AsCalcul >= AsMax){
//               AsSup = "--"; 
//             } else { 
//               AsSup = AsCalcul;    
//             }
//           }
//         } else if (mud >= 0.372 && mud < 0.48) { // Pivot D
//           var Me_ud = 0.372 * b * (d ** 2) * fcd * 1000;
//           var xx = 0.617 * d;
//           var As_ud = Me_ud / (sigmaS * (d - 0.4 * xx)) * 10;
//           var As_c = (Meq - Me_ud) / (fyd * (d - dPrime)) * 10;
//           AsCalcul = As_ud + As_c;
          
//           if (Med > 0) {
//             if (AsCalcul >= AsMax){
//               AsSup = "--"; 
//             } else { 
//               AsSup = As_c;    
//             }
//           } else {
//             if (AsCalcul >= AsMax){
//               AsSup = "--"; 
//             } else { 
//               AsSup = AsCalcul;    
//             }
//           }
//         } else { // Section entièrement comprimée
//           AsSup = "--";
//         }
//       }
//     }      
//     return AsSup;
//   }

//   AsInfR() { // Section réelle inf
//     const AsInf = this.AsInf();
//     const AsMin = this.AsMin();
//     const Med = this.data.Med.value;
//     let AsInfR;
//     if (AsInf === "--") {
//       AsInfR = "--"
//     } else {
//       if (Med > 0) {
//         if (AsInf <= 0 || AsInf < AsMin) {
//           AsInfR = AsMin;
//         } else {
//           AsInfR = AsInf;
//         }
//       } else {
//         AsInfR = AsInf;
//       }

//     }
//     return AsInfR;
//   }
    
//   AsSupR() { // Section réelle sup
//     const AsSup = this.AsSup();
//     const AsMin = this.AsMin();
//     const Med = this.data.Med.value;
//     let AsSupR;
//     if (AsSup === "--") {
//       AsSupR = "--"
//     } else {
//       if (Med < 0) {
//         if (AsSup <= 0 || AsSup < AsMin) {
//           AsSupR = AsMin;
//         } else {
//           AsSupR = AsSup;
//         }      
//       } else {
//         AsSupR = AsSup;
//       } 

//     } 

//     return AsSupR;
//   }

//   conclusion() {
//     const mud = this.mud();
//     const Ned = this.data.Ned.value;
//     const Med = this.data.Med.value;
//     const b = this.data.b.value;
//     const h = this.data.h.value;
//     const fcd = this.fcd();
//     const fyd = this.fyd();
//     const Meq = this.Meq();
//     const cas = this.cas();
//     const AsMax = this.AsMax();
//     const d = this.d();
//     const dPrime = this.dPrime();
//     const zu = this.zu();
//     const sigmaS = this.sigmaS();
//     let conclusion;
    
//     if (Med >= -0.01 && Med <= 0.01 ) {
//       conclusion = "Erreur" ;
//     } else {
//       if (cas === "section entièrement tendue") {
//         conclusion = "";//"Section entièrement tendue";
//       } else {
//         let AsCalcul;
    
//         if (mud <= 0.372) { // Pivot A ET B
//           AsCalcul = ((Meq * 10) / (zu * sigmaS)) - ((Ned * 0.001 * 10000) / sigmaS);
//           if (Med > 0) {
//             conclusion = AsCalcul >= AsMax ? "Conclusion: Augmenter la section du béton !" :"";// "Section sans aciers comprimées";
//           } else {
//             conclusion = AsCalcul >= AsMax ? "Conclusion: Augmenter la section du béton !" :"";// "Section sans aciers comprimées";
//           }
//         } else if (mud >= 0.372 && mud < 0.48) { // Pivot D
//           const Me_ud = 0.372 * b * (d ** 2) * fcd * 1000;
//           const xx = 0.617 * d;
//           const As_ud = Me_ud / (sigmaS * (d - 0.4 * xx)) * 10;
//           const As_c = (Meq - Me_ud) / (fyd * (d - dPrime)) * 10;
//           AsCalcul = As_ud + As_c;
    
//           if (Med > 0) {
//             conclusion = AsCalcul >= AsMax ? "Conclusion: Augmenter la section du béton !" :"";// "Section avec aciers comprimées";
//           } else {
//             conclusion = AsCalcul >= AsMax ? "Conclusion: Augmenter la section du béton !" :"";// "Section avec aciers comprimées";
//           }
//         } else { // Section entièrement comprimée
//           conclusion = "Conclusion: Augmenter la section du béton !" ;
//         }
//       }      
//     }    
//     return conclusion;
//   }

// }

// export default functions;