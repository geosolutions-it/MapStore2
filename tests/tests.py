import requests
import base64
import os
import ast

from requests.api import request

# Common Functions
#########################################

# Perform a GET request to the endpoint
def endpointrequest(url,headers,payload):
  try:
    endpointresponse = requests.request("GET", url, headers=headers, data=payload)
    return endpointresponse
  except:
    print("ENDPOINT ERROR: Can't access: " + url)
    exit(1)


# Get Access Token (for authenticated user tests)
def getaccesstoken(url,user,pwd):
  try:
    referer = url + "/mapstore/"
    loginurl = url + "/mapstore/rest/geostore/session/login"

    #  Base 64 of user:pwd
    base64login = user + ":" + pwd
    base64login_bytes = base64login.encode("ascii")
    encodebase64login = base64.b64encode(base64login_bytes)

    headers = {
      'Connection': 'keep-alive',
      'Content-Length': '0',
      'Pragma': 'no-cache',
      'Cache-Control': 'no-cache',
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + encodebase64login.decode('utf-8'),
      'sec-ch-ua-mobile': '?0',
      'Origin': url,
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      'Referer': referer
    }

    accesstokenresponse = requests.request("POST", loginurl, headers=headers, data={})

    # Try block in case that the response can't be converted directly to json
    try:
      accesstoken = accesstokenresponse.json()
      return accesstoken['access_token']
    except:
      print("WARNING: ACCESS TOKEN directly response conversion don't work")
      accesstoken = ast.literal_eval(accesstokenresponse.text)
      token = accesstoken['sessionToken']['access_token']
      return token

  except:
    print("ERROR: Can't get access token")
    exit(1)



#########################################


# Test Functions - One for every kind of test needed
#########################################

# Anonymous User - Home Page Test (Multiple URL checks)
def homepagetest(baseurl):

  # Test result Dictionary - For TEST Prints
  testresults = {}

  # List of Maps Test and Check
  listMapUrl = baseurl + "/mapstore/rest/geostore/extjs/search/category/MAP/***/thumbnail,details,featured?start=0&limit=12&includeAttributes=true"
  mapResult = endpointrequest(listMapUrl,{},{})
  testresults["MAPS"] = mapResult
  description = "Status Code:" + str(mapResult.status_code) + " Reason: " + mapResult.reason
  if mapResult.ok == False:
    print("Home Page - List of Maps test failed " + description)
    exit(1)
  else:
    print("Home Page - List of Maps test OK " + description)


  # List of DashBoards Test and Check
  listDashboardUrl = baseurl + "/mapstore/rest/geostore/extjs/search/category/DASHBOARD/***/thumbnail,details,featured?start=0&limit=12"
  dashboardResult = endpointrequest(listDashboardUrl,{},{})
  testresults["DASHBOARDS"] = dashboardResult
  description = "Status Code:" + str(dashboardResult.status_code) + " Reason: " + dashboardResult.reason
  if dashboardResult.ok == False:
    print("Home Page - List of DashBoards test failed " + description)
    exit(1)
  else:
    print("Home Page - List of DashBoards test OK " + description)


  # List of GeoStorys Test and Check
  listGeoStoryUrl = baseurl + "/mapstore/rest/geostore/extjs/search/category/GEOSTORY/***/thumbnail,details,featured?start=0&limit=12"
  geostoryResult = endpointrequest(listGeoStoryUrl,{},{})
  testresults["GEOSTORYS"] = geostoryResult
  description = "Status Code:" + str(geostoryResult.status_code) + " Reason: " + geostoryResult.reason
  if geostoryResult.ok == False:
    print("Home Page - List of GeoStorys test failed " + description)
    exit(1)
  else:
    print("Home Page - List of GeoStorys test OK " + description)


  # List of Contexts Test and Check
  listContextUrl = url = baseurl + "/mapstore/rest/geostore/extjs/search/category/CONTEXT/***/thumbnail,details,featured?start=0&limit=12"
  contextResult = endpointrequest(listContextUrl,{},{})
  testresults["CONTEXTS"] = contextResult
  description = "Status Code:" + str(contextResult.status_code) + " Reason: " + contextResult.reason
  if contextResult.ok == False:
    print("Home Page - List of Contexts test failed " + description)
    exit(1)
  else:
    print("Home Page - List of Contexts test OK " + description)


  return testresults
###

# Anonymous User - Individual Map Test
def maptest(baseurl,map_id):

  # Test result Dictionary
  testresults = {}

  IndvMapUrl = baseurl + "/mapstore/rest/geostore/data/" + str(map_id)
  mapResult = endpointrequest(IndvMapUrl,{},{})
  testresults["INDMAP"] = mapResult
  description = "Status Code:" + str(mapResult.status_code) + " Reason: " + mapResult.reason
  if mapResult.ok == False:
    print("Individual map test failed " + description)
    exit(1)
  else:
    print("Individual map test OK " + description)

  return testresults
###

# Anonymous User - Individual Dashboard Test
def dashboardtest(baseurl,dashboard_id):

  # Test result Dictionary
  testresults = {}

  IndvDashBoardUrl = baseurl + "/mapstore/rest/geostore/data/" + str(dashboard_id)
  dashboardResult = endpointrequest(IndvDashBoardUrl,{},{})
  testresults["INDDASHBOARD"] = dashboardResult
  description = "Status Code:" + str(dashboardResult.status_code) + " Reason: " + dashboardResult.reason
  if dashboardResult.ok == False:
    print("Individual dashboard test failed " + description)
    exit(1)
  else:
    print("Individual dashboard test OK " + description)

  return testresults
###

# Anonymous User - Individual Geostory Test
def geostorytest(baseurl,geostory_id):

  # Test result Dictionary
  testresults = {}

  IndvGeostoryUrl = baseurl + "/mapstore/rest/geostore/data/" + str(geostory_id)
  geostoryResult = endpointrequest(IndvGeostoryUrl,{},{})
  testresults["INDGEOSTORY"] = geostoryResult
  description = "Status Code:" + str(geostoryResult.status_code) + " Reason: " + geostoryResult.reason
  if geostoryResult.ok == False:
    print("Individual geostory test failed " + description)
    exit(1)
  else:
    print("Individual geostory test OK " + description)

  return testresults
###

# Anonymous User - Thumbnail Test
def thumbnailtest(baseurl,thumbnail_id,datauri):

  # Test result Dictionary
  testresults = {}

  ThumbnailUrl = baseurl + "/mapstore/rest/geostore/data/" + str(thumbnail_id) + "/raw?decode=datauri&v=" + datauri
  thumbnailResult = endpointrequest(ThumbnailUrl,{},{})
  testresults["THUMBNAIL"] = thumbnailResult
  description = "Status Code:" + str(thumbnailResult.status_code) + " Reason: " + thumbnailResult.reason
  if thumbnailResult.ok == False:
    print("Thumbnail test failed " + description)
    exit(1)
  else:
    print("Thumbnail test OK " + description)

  return testresults
###

# Anonymous User - Datadir Externalization Test
def datadirtest(baseurl):

  # Test result Dictionary
  testresults = {}

  dataextUrl = baseurl + "/mapstore/configs/localConfig.json"
  dataextResult = endpointrequest(dataextUrl,{},{})
  testresults["DATAEXT"] = dataextResult
  description = "Status Code:" + str(dataextResult.status_code) + " Reason: " + dataextResult.reason
  if dataextResult.ok == False:
    print("Datadir Externalization test failed " + description)
    exit(1)

  # Check the modification of the localConfig.json in base to localConfig.json.patch upload in the MapStore container (See DockerfileMapStoreTest for more details)
  webjson = dataextResult.json()
  if "MyAwesomePlugin" in webjson["plugins"]["desktop"]:
    print("Datadir Externalization test OK " + description)
    return testresults
  else:
    print("Datadir Externalization test failed" )
    exit(1)
###



# Authenticated User - Individual Private Map Test
def prvmaptest(baseurl,map_id,accesstoken):

  # Test result Dictionary
  testresults = {}

  headers = {
    'Authorization': 'Bearer ' + accesstoken
  }

  IndvMapUrl = baseurl + "/mapstore/rest/geostore/data/" + str(map_id)
  prvmapResult = endpointrequest(IndvMapUrl,headers,{})
  testresults["PRVINDMAP"] = prvmapResult
  description = "Status Code:" + str(prvmapResult.status_code) + " Reason: " + prvmapResult.reason
  if prvmapResult.ok == False:
    print("Individual private map test failed " + description)
    exit(1)
  else:
    print("Individual private map test OK " + description)

  return testresults
###

# Authenticated User (Admin) - Users Manager Test
def usrmanagertest(baseurl,accesstoken):

  # Test result Dictionary
  testresults = {}

  headers = {
    'Authorization': 'Bearer ' + accesstoken
  }

  usrsManagerUrl = baseurl + "/mapstore/rest/geostore/extjs/search/users/*?start=0&limit=12"
  usrmanagerResult = endpointrequest(usrsManagerUrl,headers,{})
  testresults["USERSMANAGER"] = usrmanagerResult
  description = "Status Code:" + str(usrmanagerResult.status_code) + " Reason: " + usrmanagerResult.reason
  if usrmanagerResult.ok == False:
    print("Admin - Users Manager test failed " + description)
    exit(1)
  else:
    print("Admin - Users Manager test test OK " + description)

  return testresults
###

# Authenticated User (Admin) - Groups Test
def groupstest(baseurl,accesstoken):

  # Test result Dictionary
  testresults = {}

  headers = {
    'Authorization': 'Bearer ' + accesstoken
  }

  groupsUrl = baseurl + "/mapstore/rest/geostore/extjs/search/users/***?start=0&limit=5"
  groupsResult = endpointrequest(groupsUrl,headers,{})
  testresults["GROUPS"] = groupsResult
  description = "Status Code:" + str(groupsResult.status_code) + " Reason: " + groupsResult.reason
  if groupsResult.ok == False:
    print("Admin - Groups test failed " + description)
    exit(1)
  else:
    print("Admin - Groups test test OK " + description)

  return testresults
###

# Authenticated User (Admin) - Context Manager Test
def contextmanagertest(baseurl,accesstoken):

  # Test result Dictionary
  testresults = {}

  headers = {
    'Authorization': 'Bearer ' + accesstoken
  }

  contextmanagerUrl = baseurl + "/mapstore/rest/geostore/extjs/search/category/CONTEXT/***/thumbnail,details,featured?start=0&limit=12"
  contextmanagerResult = endpointrequest(contextmanagerUrl,headers,{})
  testresults["CTXTMANAGER"] = contextmanagerResult
  description = "Status Code:" + str(contextmanagerResult.status_code) + " Reason: " + contextmanagerResult.reason
  if contextmanagerResult.ok == False:
    print("Admin - Context Manager test failed " + description)
    exit(1)
  else:
    print("Admin - Context Manager test OK " + description)

  return testresults
###


# Authenticated User - Embedded html for maps Test
def embmapstest(baseurl,map_id,accesstoken):

  # Test result Dictionary
  testresults = {}

  headers = {
    'Authorization': 'Bearer ' + accesstoken
  }
  # type html
  EmbMapsUrl = baseurl + "/mapstore/embedded.html#/" + str(map_id)
  embmapResult = endpointrequest(EmbMapsUrl,headers,{})
  testresults["PRVEMBMAP"] = embmapResult
  description = "Status Code:" + str(embmapResult.status_code) + " Reason: " + embmapResult.reason
  if embmapResult.ok == False:
    print("Embedded html for maps test failed " + description)
    exit(1)
  else:
    print("Embedded html for maps test OK " + description)

  return testresults
###


# Authenticated User - Embedded html for dashboards Test
def embdashtest(baseurl,dashboard_id,accesstoken):

  # Test result Dictionary
  testresults = {}

  headers = {
    'Authorization': 'Bearer ' + accesstoken
  }

  EmbDashUrl = baseurl + "/mapstore/dashboard-embedded.html#/" + str(dashboard_id)
  embdashResult = endpointrequest(EmbDashUrl,headers,{})
  testresults["PRVEMBDASH"] = embdashResult
  description = "Status Code:" + str(embdashResult.status_code) + " Reason: " + embdashResult.reason
  if embdashResult.ok == False:
    print("Embedded html for dashboards test failed " + description)
    exit(1)
  else:
    print("Embedded html for dashboards test OK " + description)

  return testresults
###


# Authenticated User - Embedded html for geostory Test
def embgeostorytest(baseurl,geostory_id,accesstoken):

  # Test result Dictionary
  testresults = {}

  headers = {
    'Authorization': 'Bearer ' + accesstoken
  }

  EmbGeostoryUrl = baseurl + "/mapstore/geostory-embedded.html#/" + str(geostory_id)
  embgeostoryResult = endpointrequest(EmbGeostoryUrl,headers,{})
  testresults["PRVEMBGEOSTORY"] = embgeostoryResult
  description = "Status Code:" + str(embgeostoryResult.status_code) + " Reason: " + embgeostoryResult.reason
  if embgeostoryResult.ok == False:
    print("Embedded html for geostory test failed " + description)
    exit(1)
  else:
    print("Embedded html for geostory test OK " + description)

  return testresults
###



#########################################





###################################################################



############
### Main ###
############


# Environment Variables in the Test Container (Source: .env file)
'''
ENV_URL,
ANN_MAP_ID,
ANN_DASHBOARD_ID,
ANN_GEOSTORY_ID,
ANN_THUMBNAIL_ID,
ANN_DATAURI,
AT_USR,
AT_PWD,
PRV_MAP_ID,
PRV_DASHBOARD_ID,
PRV_GEOSTORY_ID]
'''
######################


try:

  # Main URL of the MapStore environment
  envurl = os.environ['ENV_URL']

  # Anonymous - Map ID
  ann_map_id = os.environ['ANN_MAP_ID']

  # Anonymous - Dashboard ID
  ann_dashboard_id = os.environ['ANN_DASHBOARD_ID']

  # Anonymous - Geostory ID
  ann_geostory_id = os.environ['ANN_GEOSTORY_ID']

  # Anonymous - Thumbnail ID
  ann_thumbnail_id = os.environ['ANN_THUMBNAIL_ID']

  # Anonymous - Thumbnail Datauri
  ann_datauri = os.environ['ANN_DATAURI']

  # Access Token - User
  at_usr = os.environ['AT_USR']

  # Access Token - Password
  at_pwd = os.environ['AT_PWD']

  #Authenticated User - Map ID
  prv_map_id = os.environ['PRV_MAP_ID']

  #Authenticated User - Dashboard ID
  prv_dashboard_id = os.environ['PRV_DASHBOARD_ID']

  #Authenticated User - Geostory ID
  prv_geostory_id = os.environ['PRV_GEOSTORY_ID']

except:
  print("Missing Parameters")
  exit(1)



########################################
##########  Anonymous User  ############
########################################

### CoreSpatial Portal Tests
homepageResults = homepagetest(envurl)
###


### Individual Tests

# Map Test
mapResult = maptest(envurl,ann_map_id)

# Dashboard Test
dashboardResult = dashboardtest(envurl,ann_dashboard_id)

# Geostory Test
geostoryResult = geostorytest(envurl,ann_geostory_id)

# Thumbnail Test
thumbnailResult = thumbnailtest(envurl,ann_thumbnail_id,ann_datauri)
###


### Datadir Externalization Test
datadirResult = datadirtest(envurl)
###

########################################


########################################
########  Authenticated User  ##########
########################################

### Get Access Token for a user
accesstoken = getaccesstoken(envurl,at_usr,at_pwd)


### Individual Tests
# Private Map
invmapResult = prvmaptest(envurl,prv_map_id,accesstoken)


### Optional Tests
# Users Manager (as an admin)
usermanagerResult = usrmanagertest(envurl,accesstoken)

# Groups (as an admin)
groupsResult = groupstest(envurl,accesstoken)

# Context Manager (as an admin)
contextmanagerResult = contextmanagertest(envurl,accesstoken)

# Embedded html for maps
embebbedmapResult = embmapstest(envurl,prv_map_id,accesstoken)

# Embedded html for dashboards
embebbeddashboardResult = embdashtest(envurl,prv_dashboard_id,accesstoken)

# Embedded html for geostory
embebbedgeostoryResult = embgeostorytest(envurl,prv_geostory_id,accesstoken)

########################################



print("Success - All test passed")
exit(0)



###################################################################
