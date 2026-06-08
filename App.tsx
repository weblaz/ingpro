import React, { Component, ErrorInfo, ReactNode } from 'react';
import '@radix-ui/themes/styles.css';
import { Theme } from '@radix-ui/themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './src/contexts/I18nContext';
import { SubscriptionProvider } from './src/contexts/SubscriptionContext';
import { AuthProvider } from './src/contexts/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import AuthRoute from './src/components/AuthRoute';
import PublicHome from './src/pages/public/PublicHome';
import About from './src/pages/public/About';
import Solutions from './src/pages/public/Solutions';
import Features from './src/pages/public/Features';
import Sectors from './src/pages/public/Sectors';
import Pricing from './src/pages/public/Pricing';
import Contact from './src/pages/public/Contact';
import Login from './src/pages/public/Login';
import Signup from './src/pages/public/Signup';
import Demo from './src/pages/public/Demo';
import Home from './src/pages/Home';
import Passeport from './src/pages/Passeport';
import DigitalIdentity from './src/pages/DigitalIdentity';
import Subcontracting from './src/pages/Subcontracting';
import Talents from './src/pages/Talents';
import Formation from './src/pages/Formation';
import LocalContent from './src/pages/LocalContent';
import Analytics from './src/pages/Analytics';
import Localization from './src/pages/Localization';
import Collaboration from './src/pages/Collaboration';
import Admin from './src/pages/Admin';
import Billing from './src/pages/Billing';
import UpgradePlan from './src/pages/UpgradePlan';
import Procurement from './src/pages/Procurement';
import Marketplace from './src/pages/Marketplace';
import TrainingDashboard from './src/pages/dashboard/TrainingDashboard';
import NotFound from './src/pages/NotFound';
import DemoCenter from './src/pages/admin/DemoCenter';

class ErrorBoundary extends Component<{children:ReactNode},{error:Error|null}> {
  constructor(props:{children:ReactNode}){super(props);this.state={error:null};}
  static getDerivedStateFromError(e:Error){return{error:e};}
  componentDidCatch(e:Error,i:ErrorInfo){console.error('Crash:',e,i);}
  render(){
    if(this.state.error){
      return (
        <div style={{fontFamily:'monospace',padding:32,background:'#fff',minHeight:'100vh'}}>
          <h1 style={{color:'#c0392b',fontSize:22,marginBottom:12}}>Erreur — INGI Synertran</h1>
          <p style={{color:'#333',marginBottom:8,fontWeight:'bold'}}>{this.state.error.message}</p>
          <pre style={{background:'#f5f5f5',padding:16,overflow:'auto',fontSize:11,borderRadius:4,maxHeight:400}}>
            {this.state.error.stack}
          </pre>
          <button onClick={()=>{this.setState({error:null});window.location.reload();}}
            style={{marginTop:16,padding:'8px 20px',background:'#0D2B55',color:'#fff',border:'none',borderRadius:4,cursor:'pointer'}}>
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App:React.FC=()=>(
  <ErrorBoundary>
    <Theme appearance="inherit" radius="large" scaling="100%">
      <AuthProvider>
        <I18nProvider>
          <SubscriptionProvider>
            <Router>
              <main className="min-h-screen font-sans">
                <Routes>
                  <Route path="/" element={<PublicHome/>}/>
                  <Route path="/about" element={<About/>}/>
                  <Route path="/solutions" element={<Solutions/>}/>
                  <Route path="/features" element={<Features/>}/>
                  <Route path="/sectors" element={<Sectors/>}/>
                  <Route path="/pricing" element={<Pricing/>}/>
                  <Route path="/contact" element={<Contact/>}/>
                  <Route path="/demo" element={<Demo/>}/>
                  <Route path="/login" element={<AuthRoute><Login/></AuthRoute>}/>
                  <Route path="/signup" element={<AuthRoute><Signup/></AuthRoute>}/>
                  <Route path="/register" element={<AuthRoute><Signup/></AuthRoute>}/>
                  <Route path="/upgrade" element={<UpgradePlan/>}/>
                  <Route path="/dashboard" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
                  <Route path="/dashboard/training" element={<ProtectedRoute><TrainingDashboard/></ProtectedRoute>}/>
                  <Route path="/marketplace" element={<ProtectedRoute><Marketplace/></ProtectedRoute>}/>
                  <Route path="/passeport" element={<ProtectedRoute requiredModule="passeport"><Passeport/></ProtectedRoute>}/>
                  <Route path="/passeport-entreprise" element={<ProtectedRoute requiredModule="passeport"><Passeport/></ProtectedRoute>}/>
                  <Route path="/digital-identity" element={<ProtectedRoute requiredModule="digital-identity"><DigitalIdentity/></ProtectedRoute>}/>
                  <Route path="/identite-numerique" element={<ProtectedRoute requiredModule="digital-identity"><DigitalIdentity/></ProtectedRoute>}/>
                  <Route path="/subcontracting" element={<ProtectedRoute requiredModule="subcontracting"><Subcontracting/></ProtectedRoute>}/>
                  <Route path="/sous-traitance" element={<ProtectedRoute requiredModule="subcontracting"><Subcontracting/></ProtectedRoute>}/>
                  <Route path="/procurement" element={<ProtectedRoute requiredModule="subcontracting"><Procurement/></ProtectedRoute>}/>
                  <Route path="/talents" element={<ProtectedRoute requiredModule="talents"><Talents/></ProtectedRoute>}/>
                  <Route path="/formation" element={<ProtectedRoute requiredModule="formation"><Formation/></ProtectedRoute>}/>
                  <Route path="/local-content" element={<ProtectedRoute requiredModule="local-content"><LocalContent/></ProtectedRoute>}/>
                  <Route path="/contenu-local" element={<ProtectedRoute requiredModule="local-content"><LocalContent/></ProtectedRoute>}/>
                  <Route path="/analytics" element={<ProtectedRoute requiredModule="analytics"><Analytics/></ProtectedRoute>}/>
                  <Route path="/localization" element={<ProtectedRoute requiredModule="localization"><Localization/></ProtectedRoute>}/>
                  <Route path="/collaboration" element={<ProtectedRoute><Collaboration/></ProtectedRoute>}/>
                  <Route path="/admin" element={<ProtectedRoute requiredModule="admin"><Admin/></ProtectedRoute>}/>
                  <Route path="/admin/demo-center" element={<ProtectedRoute requiredModule="admin"><DemoCenter/></ProtectedRoute>}/>
                  <Route path="/billing" element={<ProtectedRoute><Billing/></ProtectedRoute>}/>
                  <Route path="*" element={<NotFound/>}/>
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover/>
              </main>
            </Router>
          </SubscriptionProvider>
        </I18nProvider>
      </AuthProvider>
    </Theme>
  </ErrorBoundary>
);

export default App;