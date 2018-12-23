import React from "react"
import Utils from "utils"

//renders an appropriate error message when loading a snapshot failed
var SnapshotLoadingError = React.createClass({
    displayName: "SnapshotLoadingError",

    propTypes: {
        //the project for which loading the snapshot failed
        project: React.PropTypes.any.isRequired,
        //under some circumstances this component will schedule a reload.
        //This callback will be called as soon as loading the snapshot should be retried.
        reload: React.PropTypes.func.isRequired,
    },

    componentWillUnmount: function() {
        if(this.reloadTimeout) {
            window.clearTimeout(this.reloadTimeout)
            this.reloadTimeout = undefined
        }
    },

    scheduleReload: function() {
        if(!this.reloadTimeout) {
          this.reloadTimeout = setTimeout(this.doReload, 10000)
        }
    },

    doReload: function() {
        this.props.reload()
        this.reloadTimeout = undefined
    },

    render: function() {
        var props = this.props
        var errorMessage
        var project = props.project
        //analysis already running/failed/finished
        if (project.analysis_status == "succeeded"){
          errorMessage = <div><h3 className="alert alert-warning"><i className="fa fa-exclamation-triangle" /> No such branch/commit found</h3></div>
        } else if (project.analysis_status == "in_progress"){
          //analysis running
          this.scheduleReload()
          errorMessage = <div><h3 className="alert alert-info"><i className="fa fa-spin fa-refresh" /> Analysis in progress...</h3></div>
        } else if (project.analysis_status == 'failed' && project.fetch_status != 'succeeded') {
          //fetch failed
          errorMessage = <div>
            <h3 className="alert alert-warning"><i className="fa fa-exclamation-triangle" /> We were unable to fetch this repository.</h3>
            <p>Please make sure that you configured the source settings correctly.</p>
          </div>
        } else if (project.analysis_status == 'failed') {
          //analysis failed
          errorMessage = <div>
            <h3 className="alert alert-warning"><i className="fa fa-exclamation-triangle" /> Analysis failed. Please check the Log tab.</h3>
          </div>
        } else {
          //queued, but not started so far
          this.scheduleReload()
          var queuePosition
          if (props.project) {
            queuePosition = <span>(queue position: <strong>{props.project.analysis_queue_position || 'unknown'}</strong>)</span>
          }
          errorMessage = <div>
            <h3 className="alert alert-info">
              <i className="fa fa-spin fa-refresh" /> Waiting for analysis to start {queuePosition}
            </h3>
            <p>This page will update automatically when the analysis starts.</p>
          </div>
        }
        return errorMessage
    },
})

export default SnapshotLoadingError
