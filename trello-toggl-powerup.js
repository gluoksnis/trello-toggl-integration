/* global TrelloPowerUp */

// Toggl Track API configuration
var TOGGL_API_URL = 'https://api.track.toggl.com/api/v9';

// CORS Proxy - REPLACE THIS WITH YOUR CLOUDFLARE WORKER URL
// Example: 'https://toggl-proxy.YOUR-NAME.workers.dev/?url='
// See FIX_405_ERROR.md for setup instructions
var CORS_PROXY = 'https://toggl-trello-cors.v-gluoksnis.workers.dev/?url=';

// NOTE: The cors-anywhere.herokuapp.com proxy will give 405 or 400 errors!
// You MUST set up your own Cloudflare Worker (2 minutes, free)
// Instructions in FIX_405_ERROR.md

// Helper function to make API calls through proxy
function makeTogglRequest(endpoint, options, apiToken) {
  // Build the full Toggl URL
  var togglUrl = TOGGL_API_URL + endpoint;
  // Encode it for the proxy
  var url = CORS_PROXY + encodeURIComponent(togglUrl);
  
  console.log('Toggl endpoint:', endpoint);
  console.log('Full Toggl URL:', togglUrl);
  console.log('Proxy URL:', url);
  console.log('Method:', options.method || 'GET');
  
  var headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa(apiToken + ':api_token')
  };
  
  var fetchOptions = {
    method: options.method || 'GET',
    headers: headers
  };
  
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
    console.log('Request body:', fetchOptions.body);
  }
  
  return fetch(url, fetchOptions)
    .then(function(response) {
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      return response;
    })
    .catch(function(error) {
      console.error('Fetch error:', error);
      throw error;
    });
}

// Helper function to verify if a timer is still running in Toggl
function verifyTimerRunning(t, apiToken, timerId) {
  // Get current running timer from Toggl
  return makeTogglRequest('/me/time_entries/current', {
    method: 'GET'
  }, apiToken)
  .then(function(response) {
    if (!response.ok) {
      console.warn('Could not verify timer status:', response.status);
      // If we can't verify, assume it's still running to avoid false positives
      return true;
    }
    return response.json();
  })
  .then(function(data) {
    // If there's a current timer and it matches our ID, it's running
    if (data && data.id && data.id.toString() === timerId.toString()) {
      return true;
    }
    // No current timer or different timer - our timer is not running
    return false;
  })
  .catch(function(error) {
    console.error('Error verifying timer:', error);
    // On error, assume still running to avoid false positives
    return true;
  });
}

// Initialize the Power-Up
TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return t.get('board', 'shared', 'togglApiToken')
      .then(function(apiToken) {
        if (!apiToken) {
          return [{
            icon: 'https://raw.githubusercontent.com/toggl/toggl_api_docs/master/public/favicon.ico',
            text: 'Setup Toggl',
            callback: function(t) {
              return t.popup({
                title: 'Configure Toggl',
                url: './setup.html',
                height: 250
              });
            }
          }];
        }
        
        // Check if there's a running timer for this card
        return t.get('card', 'private', 'runningTimerId')
          .then(function(timerId) {
            if (timerId) {
              // Verify the timer is still running in Toggl
              return verifyTimerRunning(t, apiToken, timerId)
                .then(function(isRunning) {
                  if (!isRunning) {
                    // Timer was stopped in Toggl, clean up local state
                    return t.remove('card', 'private', ['runningTimerId', 'timerStartTime'])
                      .then(function() {
                        // Show Start button instead
                        return [{
                          icon: 'https://raw.githubusercontent.com/toggl/toggl_api_docs/master/public/favicon.ico',
                          text: 'Start Timer',
                          callback: function(t) {
                            return startTimer(t, apiToken);
                          }
                        }];
                      });
                  }
                  
                  // Timer is still running, show Stop button
                  return [{
                    icon: 'https://raw.githubusercontent.com/toggl/toggl_api_docs/master/public/favicon.ico',
                    text: 'Stop Timer',
                    callback: function(t) {
                      return t.get('board', 'shared', 'togglWorkspaceId')
                        .then(function(workspaceId) {
                          return stopTimer(t, apiToken, timerId, workspaceId);
                        });
                    }
                  }];
                });
            } else {
              return [{
                icon: 'https://raw.githubusercontent.com/toggl/toggl_api_docs/master/public/favicon.ico',
                text: 'Start Timer',
                callback: function(t) {
                  return startTimer(t, apiToken);
                }
              }];
            }
          });
      });
  },
  
  'card-badges': function(t, options) {
    return Promise.all([
      t.get('card', 'private', 'runningTimerId'),
      t.get('board', 'shared', 'togglApiToken')
    ]).then(function(values) {
      var timerId = values[0];
      var apiToken = values[1];
      
      if (timerId && apiToken) {
        // Verify timer is still running in Toggl
        return verifyTimerRunning(t, apiToken, timerId)
          .then(function(isRunning) {
            if (!isRunning) {
              // Timer stopped in Toggl, clean up
              return t.remove('card', 'private', ['runningTimerId', 'timerStartTime'])
                .then(function() {
                  // Show total time instead
                  return t.get('card', 'shared', 'totalTimeTracked')
                    .then(function(totalTime) {
                      if (totalTime && totalTime > 0) {
                        var hours = Math.floor(totalTime / 3600);
                        var minutes = Math.floor((totalTime % 3600) / 60);
                        return [{
                          text: hours + 'h ' + minutes + 'm',
                          color: 'blue'
                        }];
                      }
                      return [];
                    });
                });
            }
            
            // Timer is running, show live badge
            return t.get('card', 'private', 'timerStartTime')
              .then(function(startTime) {
                var elapsed = Math.floor((Date.now() - startTime) / 1000);
                var hours = Math.floor(elapsed / 3600);
                var minutes = Math.floor((elapsed % 3600) / 60);
                var seconds = elapsed % 60;
                
                var hoursStr = hours.toString();
                if (hoursStr.length < 2) hoursStr = '0' + hoursStr;
                var minutesStr = minutes.toString();
                if (minutesStr.length < 2) minutesStr = '0' + minutesStr;
                var secondsStr = seconds.toString();
                if (secondsStr.length < 2) secondsStr = '0' + secondsStr;
                
                return [{
                  text: hoursStr + ':' + minutesStr + ':' + secondsStr,
                  color: 'red',
                  refresh: 10 // Refresh every 10 seconds for smoother updates
                }];
              });
          })
          .catch(function(error) {
            console.error('Error checking timer:', error);
            // On error, still show the badge but maybe it's outdated
            return t.get('card', 'private', 'timerStartTime')
              .then(function(startTime) {
                if (!startTime) return [];
                
                var elapsed = Math.floor((Date.now() - startTime) / 1000);
                var hours = Math.floor(elapsed / 3600);
                var minutes = Math.floor((elapsed % 3600) / 60);
                var seconds = elapsed % 60;
                
                var hoursStr = hours.toString();
                if (hoursStr.length < 2) hoursStr = '0' + hoursStr;
                var minutesStr = minutes.toString();
                if (minutesStr.length < 2) minutesStr = '0' + minutesStr;
                var secondsStr = seconds.toString();
                if (secondsStr.length < 2) secondsStr = '0' + secondsStr;
                
                return [{
                  text: hoursStr + ':' + minutesStr + ':' + secondsStr,
                  color: 'red',
                  refresh: 10
                }];
              });
          });
      }
      
      // No running timer, show total time tracked
      return t.get('card', 'shared', 'totalTimeTracked')
        .then(function(totalTime) {
          if (totalTime && totalTime > 0) {
            var hours = Math.floor(totalTime / 3600);
            var minutes = Math.floor((totalTime % 3600) / 60);
            
            return [{
              text: hours + 'h ' + minutes + 'm',
              color: 'blue'
            }];
          }
          return [];
        });
    });
  },
  
  'show-settings': function(t, options) {
    return t.popup({
      title: 'Toggl Settings',
      url: './settings.html',
      height: 184
    });
  }
});

// Start a new timer
function startTimer(t, apiToken) {
  return Promise.all([
    t.card('name'),
    t.board('name'),
    t.get('board', 'shared', 'togglWorkspaceId')
  ]).then(function(values) {
    var card = values[0];
    var board = values[1];
    var workspaceId = values[2];
    
    // Toggl API v9 requires ISO timestamp for start and duration -1 for running timer
    var now = new Date().toISOString();
    
    var timerData = {
      description: card.name,
      workspace_id: parseInt(workspaceId),
      created_with: 'Trello Power-Up',
      tags: ['trello', board.name],
      start: now,
      duration: -1,  // Negative duration means timer is running
      stop: null
    };
    
    // Use correct v9 endpoint: /workspaces/{workspace_id}/time_entries
    var endpoint = '/workspaces/' + workspaceId + '/time_entries';
    
    return makeTogglRequest(endpoint, {
      method: 'POST',
      body: timerData
    }, apiToken)
    .then(function(response) {
      if (!response.ok) {
        return response.text().then(function(text) {
          console.error('Toggl API error:', response.status, text);
          if (response.status === 401) {
            throw new Error('Invalid API token. Please check your token in settings.');
          } else if (response.status === 403) {
            throw new Error('Access denied. Check your workspace ID and permissions.');
          } else {
            throw new Error('Toggl API error: ' + response.status + ': ' + text);
          }
        });
      }
      return response.json();
    })
    .then(function(data) {
      return t.set('card', 'private', {
        runningTimerId: data.id,
        timerStartTime: Date.now()
      });
    })
    .then(function() {
      return t.alert({
        message: 'Timer started successfully!',
        duration: 3
      });
    })
    .catch(function(error) {
      console.error('Error starting timer:', error);
      return t.alert({
        message: error.message || 'Failed to start timer. Check console for details.',
        duration: 8
      });
    });
  });
}

// Stop the running timer
function stopTimer(t, apiToken, timerId, workspaceId) {
  return makeTogglRequest('/workspaces/' + workspaceId + '/time_entries/' + timerId + '/stop', {
    method: 'PATCH'
  }, apiToken)
  .then(function(response) {
    if (!response.ok) {
      throw new Error('Failed to stop timer');
    }
    return response.json();
  })
  .then(function(data) {
    var duration = data.duration || 0;
    
    return t.get('card', 'shared', 'totalTimeTracked')
      .then(function(totalTime) {
        var newTotal = (totalTime || 0) + Math.abs(duration);
        
        return t.set('card', 'shared', 'totalTimeTracked', newTotal);
      })
      .then(function() {
        return t.remove('card', 'private', ['runningTimerId', 'timerStartTime']);
      })
      .then(function() {
        return t.alert({
          message: 'Timer stopped!',
          duration: 3
        });
      });
  })
  .catch(function(error) {
    console.error('Error stopping timer:', error);
    return t.alert({
      message: 'Failed to stop timer. Please try again.',
      duration: 5
    });
  });
}