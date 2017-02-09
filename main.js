import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Bob from './components/Bob.jsx';


ReactDOM.render(
  <MuiThemeProvider>
    <div>
    <Bob />
    </div>
    </MuiThemeProvider>,
  document.getElementById('root')
);
