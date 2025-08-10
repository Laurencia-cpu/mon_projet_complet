import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Accueil from './src/screens/Accueil';
import lis from './src/screens/lis';
import Offres from './src/screens/Offres';
import Contact from './src/screens/Contact';
import Ac from './src/screens/Ac';
import EspaceClient from './src/screens/EspaceClient';
import Application from './src/screens/Application';
import ForgotPassword from './src/screens/ForgotPassword';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import DashbordScreen from './src/screens/DashbordScreen';
import BonSaisieScreen from './src/screens/BonSaisieScreen';
import Agent from './src/screens/Agent';
import Admin from './src/screens/Admin';
import GererU from './src/screens/GererU';
import Gererpara from './src/screens/Gererpara';
import fournisseur from './src/screens/fournisseur';
import Reception from './src/screens/Reception';
import Edition from './src/screens/Edition';
import Statistique from './src/screens/Statistique';
import PageAchat from './src/screens/PageAchat';
import Pesée from './src/screens/Pesée';
import Facture from './src/screens/Facture';
// import HistoriqueScreen from './src/screens/HistoriqueScreen';
// import ReceptionScreen from './src/screens/ReceptionScreen';
// import ProfilScreen from './src/screens/ProfilScreen';
// import StatistiquesScreen from './src/screens/StatistiquesScreen';
// import SupportScreen from './src/screens/SupportScreen';
import Pdp from './src/screens/Pdp';
import Collecte from './src/screens/Collecte';


import TypeMetaux from './src/screens/TypeMetaux';
import LieuCollecte from './src/screens/LieuCollecte';
import GrilleTarifaire from './src/screens/GrilleTarifaire';
import CollecteEnregistre from './src/screens/CollecteEnregistre';
import Tournee from './src/screens/Tournee';
import Stock from './src/screens/Stock';
import CorrigerCollecte from './src/screens/CorrigerCollecte';
import FusionLots from './src/screens/FusionLots';
import HistoriqueCorrection from './src/screens/HistoriqueCorrection';
import StatQuantite from './src/screens/StatQuantite';
import Depense from './src/screens/Depense';
import Performance from './src/screens/Performance';
import Profil from './src/screens/Profil'
// import RapportPdfScreen from './src/screens/RapportPdfScreen';
// import PerformanceScreen from './src/screens/PerformanceScreen';



// Définir le type de navigation
export type RootStackParamList = {
  Accueil: undefined;
  lis:undefined;
  Offres:undefined;
  Contact:undefined;
  Ac:undefined;
  EspaceClient:undefined;
  Application:undefined;
  ForgotPassword:undefined;
  ResetPasswordScreen:undefined;
  DashbordScreen:undefined;
  BonSaisieScreen:undefined;
  Agent:undefined;
  Admin:undefined;
  GererU:undefined;
   Gererpara:undefined;
   fournisseur:undefined;
   Reception:undefined;
   Edition:undefined;
   Statistique:undefined;
   PageAchat:undefined;
   Pesée:undefined;
   Facture:undefined;
  // HistoriqueScreen:undefined;
  // ReceptionScreen:undefined;
  // ProfilScreen:undefined;
  // StatistiquesScreen:undefined;
  Pdp:undefined;
  Profil:undefined,
  Collecte:undefined;
  TypeMetaux:undefined;
  LieuCollecte:undefined;
  GrilleTarifaire:undefined;
  CollecteEnregistre:undefined;
  Tournee:undefined;
  Stock:undefined;
  CorrigerCollecte:undefined;
  FusionLots:undefined;
  HistoriqueCorrection:undefined;
  StatQuantite:undefined;
  Depense:undefined;
  Performance:undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Accueil" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Accueil" component={Accueil} />
        <Stack.Screen name="lis"component={lis} />
        <Stack.Screen name="Offres" component={Offres} />
        <Stack.Screen name="Contact" component={Contact} />
        <Stack.Screen name="Ac" component={Ac} />
        <Stack.Screen name="EspaceClient" component={EspaceClient} />
        <Stack.Screen name="Application" component={Application} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
        <Stack.Screen name="DashbordScreen" component={DashbordScreen} />
        <Stack.Screen name="BonSaisieScreen" component={BonSaisieScreen} />
        <Stack.Screen name="Agent" component={Agent}/>
        <Stack.Screen name="Admin" component={Admin}/>
        <Stack.Screen name="GererU" component={GererU}/>
        <Stack.Screen name="Gererpara" component={Gererpara}/>
        <Stack.Screen name="Reception" component={Reception}/>
        {/* <Stack.Screen name="HistoriqueScreen" component={HistoriqueScreen} />
        <Stack.Screen name="ReceptionScreen" component={ReceptionScreen} />
        <Stack.Screen name="ProfilScreen" component={ProfilScreen} />
        <Stack.Screen name="StatistiquesScreen" component={StatistiquesScreen} /> */}
        <Stack.Screen name="Profil" component={Profil} />
        <Stack.Screen name="Pdp" component={Pdp} />
        <Stack.Screen name="fournisseur" component={fournisseur}/>
        <Stack.Screen name="Edition" component={Edition}/>
        <Stack.Screen name="Statistique" component={Statistique}/>
        <Stack.Screen name="PageAchat" component={PageAchat}/>
        <Stack.Screen name="Pesée" component={Pesée}/>
        <Stack.Screen name="Facture" component={Facture}/>
        <Stack.Screen name="Collecte" component={Collecte}/>

  
      <Stack.Screen name="TypeMetaux" component={TypeMetaux} />
      <Stack.Screen name="LieuCollecte" component={LieuCollecte} />
      <Stack.Screen name="GrilleTarifaire" component={GrilleTarifaire} />
      <Stack.Screen name="CollecteEnregistre" component={CollecteEnregistre} />
      <Stack.Screen name="Tournee" component={Tournee} />
      <Stack.Screen name="Stock" component={Stock} />
      <Stack.Screen name="CorrigerCollecte" component={CorrigerCollecte} />
      <Stack.Screen name="FusionLots" component={FusionLots} />
      <Stack.Screen name="HistoriqueCorrection" component={HistoriqueCorrection} />
      <Stack.Screen name="StatQuantite" component={StatQuantite} />
      <Stack.Screen name="Depense" component={Depense} />
      <Stack.Screen name="Performance" component={Performance} />
      {/*<Stack.Screen name="RapportPdfScreen" component={RapportPdfScreen} />
       */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

