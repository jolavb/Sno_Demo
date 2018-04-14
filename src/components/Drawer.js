import React from 'react';
import { withStyles } from 'material-ui/styles';
import classNames from 'classnames';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import List from 'material-ui/List';
import { MenuItem } from 'material-ui/Menu';
import Typography from 'material-ui/Typography';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';


import TrailList from './TrailList';
import OpenLayersMap from './OpenLayersMap';
import MapControls from './MapControls';
import ImportExport from './ImportExport';

const drawerWidth = 300;

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    background: '#040404',
    position: 'absolute',
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  'appBarShift-right': {
    marginRight: drawerWidth,
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 20,
  },
  hide: {
    display: 'none',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  }
});


class PersistentDrawer extends React.Component {
  state = {
    open: false,
    anchor: 'left',
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
  };

  handleChangeAnchor = event => {
    this.setState({
      anchor: event.target.value,
    });
  };

  render() {

    const { classes, theme, modifyTrail, canCreate, trails, mode, hydrants,
      selectedTrail, toggleCreate, createObject, modifyHydrant, changeMode, importKMLClicked,
      trailSelected } = this.props

    const { anchor, open } = this.state;

    const drawer = (
      <Drawer
        variant="persistent"
        anchor={anchor}
        open={open}
        classes={{
          paper: classes.drawerPaper,
        }}
      >
        <div className={classes.drawerHeader}>
          <IconButton onClick={this.handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        <TrailList
          modifyTrail={modifyTrail}
          canCreate={canCreate}
          toggleCreate={toggleCreate}
          trails={trails}
          trailSelected={trailSelected}
          mode={mode}
          hydrants={hydrants}
          selected={selectedTrail}
        />
      </Drawer>
    );


    let before = null;
    let after = null;

    if (anchor === 'left') {
      before = drawer;
    } else {
      after = drawer;
    }

    return (
      <div className={classes.root}>
        <div className={classes.appFrame}>
          <AppBar
            className={classNames(classes.appBar, {
              [classes.appBarShift]: open,
              [classes[`appBarShift-${anchor}`]]: open,
            })}
          >
            <Toolbar disableGutters={!open}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, open && classes.hide)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="title" color="inherit" noWrap>
                SnoTrack
              </Typography>
            </Toolbar>
            <div id="searchLocations"></div>
          </AppBar>
          {before}
          <main
            className={classNames(classes.content, classes[`content-${anchor}`], {
              [classes.contentShift]: open,
              [classes[`contentShift-${anchor}`]]: open,
            })}
          >
            <div className={classes.drawerHeader} />

            <OpenLayersMap
              mode={mode}
              canCreate={canCreate}
              createObject={createObject}
              modifyTrail={modifyTrail}
              modifyHydrant={modifyHydrant}
              trails={trails}
              hydrants={hydrants}
              selectedTrail={selectedTrail}
            />

            <MapControls
              mode={mode}
              changeMode={changeMode}
            />

            <ImportExport
              importKMLClicked={importKMLClicked}
              trails={trails}
              hydrants={hydrants}
            />

          </main>
          {after}
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(PersistentDrawer);