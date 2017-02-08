import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from './app.jsx';
import Bob from './bob.jsx';


ReactDOM.render(
  <MuiThemeProvider>
    <div>
    <Bob />
    </div>
    </MuiThemeProvider>,
  document.getElementById('root')
);
