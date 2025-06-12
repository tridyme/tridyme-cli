
import RectangularSection from '../../Views/RectangularSectionAnalysis/Utils/Calculations/RectangularSection.js';

import test_1 from './initialState_test_1.js';
import test_2 from './initialState_test_2.js';
import test_3 from './initialState_test_3.js';
import test_4 from './initialState_test_4.js';
import test_5 from './initialState_test_5.js';
import test_6 from './initialState_test_6.js';




const tolerance = 0.03;

const ecartType = (value, target) => {
  return target !== 0 ? Math.abs((value - target) / target) : 0;
}


describe("Test", () => {
  
  it("Test N°1 - ", () => {
    const FC = new RectangularSection(test_1.data);
    const analysis =  FC.analysis();

    const d = analysis.d.value;
    const fcm = analysis.fcm.value;
    const fcd = analysis.fcd.value;
    
    const fctm = analysis.fctm.value;
    const fyd = analysis.fyd.value;
    const mud = analysis.mud.value;
    const alphau = analysis.alphau.value;

    const zu = analysis.zu.value;
    const As_sup_min = analysis.AsSupMin.value;
    const As_inf_min = analysis.AsInfMin.value;
    const As_sup = analysis.AsSup.value;
    const As_inf = analysis.AsInf.value;

    expect(ecartType(d,0.63)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(fcm, 48)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(fcd, 26.67)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(fctm, 3.51)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(fyd, 400)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(mud, 0.1323)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(alphau, 0.1781)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(zu, 0.112)).toBeLessThanOrEqual(tolerance);

    expect(ecartType(As_sup_min, 5.73)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(As_inf_min, 5.73)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(As_sup, 5.73)).toBeLessThanOrEqual(tolerance);
    expect(ecartType(As_inf, 27.51)).toBeLessThanOrEqual(tolerance);
  
  });

  // it("Test N°2 - ", () => {
  //   const FC = new Main(test_2.data);
  //   const analysis =  FC.main();

  //   const d = analysis.d.value;
  //   const fcm = analysis.fcm.value;
  //   const fcd = analysis.fcd.value;
    
  //   const fctm = analysis.fctm.value;
  //   const fyd = analysis.fyd.value;
  //   const mud = analysis.mud.value;
  //   const alphau = analysis.alphau.value;

  //   const zu = analysis.zu.value;
  //   const As_sup_min = analysis.AsSupMin.value;
  //   const As_inf_min = analysis.AsInfMin.value;
  //   const As_sup = analysis.AsSupMax.value;
  //   const As_inf = analysis.AsInfMax.value;

  //   expect(ecartType(d,0.63)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcm, 48)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcd, 26.67)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fctm, 3.51)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fyd, 400)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(mud, 0.1323)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(alphau, 0.1781)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(zu, 0.112)).toBeLessThanOrEqual(tolerance);

  //   expect(ecartType(As_sup_min, 5.73)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf_min, 5.73)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_sup, 27.51)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf, 5.73)).toBeLessThanOrEqual(tolerance);
  
  // });

  // it("Test N°3 - ", () => {
  //   const FC = new Main(test_3.data);
  //   const analysis =  FC.main();

  //   const d = analysis.d.value;
  //   const fcm = analysis.fcm.value;
  //   const fcd = analysis.fcd.value;
    
  //   const fctm = analysis.fctm.value;
  //   const fyd = analysis.fyd.value;
  //   const mud = analysis.mud.value;
  //   const alphau = analysis.alphau.value;

  //   const zu = analysis.zu.value;
  //   const As_sup_min = analysis.AsSupMin.value;
  //   const As_inf_min = analysis.AsInfMin.value;
  //   const As_sup = analysis.AsSupMax.value;
  //   const As_inf = analysis.AsInfMax.value;

  //   expect(ecartType(d,0.63)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcm, 48)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcd, 26.67)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fctm, 3.51)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fyd, 400)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(mud, 0.1508)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(alphau, 0.2053)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(zu, 0.129)).toBeLessThanOrEqual(tolerance);

  //   expect(ecartType(As_sup_min, 5.73)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf_min, 5.73)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_sup, 5.73)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf, 23.69)).toBeLessThanOrEqual(tolerance);
  
  // });

  // it("Test N°4 - ", () => {
  //   const FC = new Main(test_4.data);
  //   const analysis =  FC.main();

  //   const d = analysis.d.value;
  //   const fcm = analysis.fcm.value;
  //   const fcd = analysis.fcd.value;
    
  //   const fctm = analysis.fctm.value;
  //   const fyd = analysis.fyd.value;
  //   const mud = analysis.mud.value;
  //   const alphau = analysis.alphau.value;

  //   const zu = analysis.zu.value;
  //   const As_sup_min = analysis.AsSupMin.value;
  //   const As_inf_min = analysis.AsInfMin.value;
  //   const As_sup = analysis.AsSupMax.value;
  //   const As_inf = analysis.AsInfMax.value;

  //   expect(ecartType(d,0.63)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcm, 48)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcd, 26.67)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fctm, 3.51)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fyd, 400)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(mud, 0.1508)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(alphau, 0.2053)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(zu, 0.129)).toBeLessThanOrEqual(tolerance);

  //   expect(ecartType(As_sup_min, 5.73)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf_min, 5.73)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_sup, 23.69)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf, 5.73)).toBeLessThanOrEqual(tolerance);
  
  // });

  // it("Test N°5 - ", () => {
  //   const FC = new Main(test_5.data);
  //   const analysis =  FC.main();

  //   const d = analysis.d.value;
  //   const fcm = analysis.fcm.value;
  //   const fcd = analysis.fcd.value;
    
  //   const fctm = analysis.fctm.value;
  //   const fyd = analysis.fyd.value;
  //   const mud = analysis.mud.value;
  //   const alphau = analysis.alphau.value;

  //   const zu = analysis.zu.value;
  //   const As_sup_min = analysis.AsSupMin.value;
  //   const As_inf_min = analysis.AsInfMin.value;
  //   const As_sup = analysis.AsSupMax.value;
  //   const As_inf = analysis.AsInfMax.value;

  //   expect(ecartType(d,0.63)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcm, 38)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcd, 20)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fctm, 2.9)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fyd, 400)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(mud, 0.2011)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(alphau, 0.2835)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(zu, 0.179)).toBeLessThanOrEqual(tolerance);

  //   expect(ecartType(As_sup_min, 4.75)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf_min, 4.75)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_sup, 4.75)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf,24.81)).toBeLessThanOrEqual(tolerance);
  
  // });

  // it("Test N°6 - ", () => {
  //   const FC = new Main(test_6.data);
  //   const analysis =  FC.main();

  //   const d = analysis.d.value;
  //   const fcm = analysis.fcm.value;
  //   const fcd = analysis.fcd.value;
    
  //   const fctm = analysis.fctm.value;
  //   const fyd = analysis.fyd.value;
  //   const mud = analysis.mud.value;
  //   const alphau = analysis.alphau.value;

  //   const zu = analysis.zu.value;
  //   const As_sup_min = analysis.AsSupMin.value;
  //   const As_inf_min = analysis.AsInfMin.value;
  //   const As_sup = analysis.AsSupMax.value;
  //   const As_inf = analysis.AsInfMax.value;

  //   expect(ecartType(d,1.13)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcm, 40)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fcd, 26.7)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fctm, 3.5)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(fyd, 400)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(mud, 0.0372)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(alphau, 0.0473)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(zu, 0.053)).toBeLessThanOrEqual(tolerance);

  //   expect(ecartType(As_sup_min, 14.4)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf_min, 14.4)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_sup, 14.4)).toBeLessThanOrEqual(tolerance);
  //   expect(ecartType(As_inf,14.4)).toBeLessThanOrEqual(tolerance);
  
  // });

})
