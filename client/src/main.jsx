// ============================================================
// PONTO DE ENTRADA DA APLICAÇÃO REACT
// ============================================================
// Esse é o primeiro arquivo que roda. Ele "planta" o App
// dentro do <div id="root"> que existe no index.html.
//
// Aqui também configuramos o BrowserRouter, que é o que
// permite termos várias "páginas" (rotas) no React, como
// /  (home)  e  /poll/:id  (uma enquete específica),
// sem precisar recarregar o site inteiro a cada navegação.
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
