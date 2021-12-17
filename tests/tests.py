import requests
import json

from requests.api import request

# Common Functions
#########################################

# Perform a GET request to the endpoint
def endpointrequest(url,headers,payload):
  try:
    endpointresponse = requests.request("GET", url, headers=headers, data=payload)
    return endpointresponse
  except:
    print("Can't access MapStore (website unavailable)")
    exit(1)
  

# Get local json config file
def getlocaljsonconfig():
  
  # Just for testing 
  jsontestfile = endpointrequest("https://dev-mapstore.geosolutionsgroup.com/mapstore/configs/localConfig.json",{},{})
  ###

  #FIXTHIS get local json from the container

  targetjson = jsontestfile.json()
  return targetjson


def getauthtoken(username, password):
  token = ""
  
  return token
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
def datadirtest(baseurl,localconfigjson):
  
  # Test result Dictionary
  testresults = {}
  
  dataextUrl = baseurl + "/mapstore/configs/localConfig.json"
  dataextResult = endpointrequest(dataextUrl,{},{})
  testresults["DATAEXT"] = dataextResult
  description = "Status Code:" + str(dataextResult.status_code) + " Reason: " + dataextResult.reason
  if dataextResult.ok == False:
    print("Datadir Externalization test failed " + description)
    exit(1)

  # Datadir File Comparison
  webconfigjson = dataextResult.json()
  localconfigjson = json.dumps(localconfigjson,sort_keys=True)
  webconfigjson = json.dumps(webconfigjson,sort_keys=True)
  if localconfigjson == webconfigjson:
    print("Datadir Externalization test OK " + description)
    return testresults
  else:
    print("Datadir Externalization test failed - JSON Files are not equal" )
    exit(1)
###

# Authenticated User - Individual Private Map Test
###


#########################################





###################################################################



############
### Main ###
############



# Main URL of the MapStore environment
envurl = "https://mapstore.geosolutionsgroup.com"


########################################
##########  Anonymous User  ############
########################################

### Mapstore Homepage Tests
homepageResults = homepagetest(envurl)
###


### Individual Tests

# Map Test
# map_id = 8129
mapResult = maptest(envurl,8129)

# Dashboard Test
# dashboard_id = 8363
dashboardResult = dashboardtest(envurl,8363)

# Geostory Test
# geostory_id = 8355
geostoryResult = geostorytest(envurl,8355)

# Thumbnail Test
# thumbnail_id = 7595  datauri = "f0fa8040-7998-11ea-aac7-2d577d62d1c7"
thumbnailResult = thumbnailtest(envurl,7595,"f0fa8040-7998-11ea-aac7-2d577d62d1c7")
###


### Datadir Externalization Test
localjson = getlocaljsonconfig()
datadirResult = datadirtest(envurl,localjson)
###

########################################


########################################
########  Authenticated User  ##########
########################################

### Individual Tests
# Private Map

### Optional Tests
# Users Manager (as an admin)
# Groups (as an admin)
# Context Manager (as an admin)

########################################


print("Success - All test passed")
exit(0)



###################################################################












###################################################################

################
#### Prints ####
################

#Home Page and Individual tests prints 

#hpTestResults = homepagetest(envurl)

# map_id = 8129
#iMapTestResult = maptest(envurl,8129)

# dashboard_id = 8363
#iDashBoardTestResult = dashboardtest(envurl,8363)

# geostory_id = 8355
#iGeostoryTestResult = geostorytest(envurl,8355)

# thumbnail_id = 7595  datauri = "f0fa8040-7998-11ea-aac7-2d577d62d1c7"
#thumbnailTestResult = thumbnailtest(envurl,7595,"f0fa8040-7998-11ea-aac7-2d577d62d1c7")



#typetst = "MAPS"           
#typetst = "DASHBOARDS"
#typetst = "GEOSTORYS"       
#typetst = "CONTEXTS"
#tstprint = hpTestResults[typetst].json()
#print(hpTestResults[typetst].text)
#print(tstprint['success'])
#print(hpTestResults[typetst].status_code)


#typetst = "INDMAP"
#tstprint = iMapTestResult[typetst].json()
#print(iMapTestResult[typetst].text)
#print(iMapTestResult[typetst].status_code)

#typetst = "INDDASHBOARD"
#tstprint = iDashBoardTestResult[typetst].json()
#print(iDashBoardTestResult[typetst].text)
#print(iDashBoardTestResult[typetst].status_code)

#typetst = "INDGEOSTORY" 
#tstprint = iGeostoryTestResult[typetst].json()
#print(iGeostoryTestResult[typetst].text)
#print(iGeostoryTestResult[typetst].status_code)

#typetst = "THUMBNAIL"       
#tstprint = thumbnailTestResult[typetst].json()
#print(thumbnailTestResult[typetst].text)
#print(thumbnailTestResult[typetst].status_code)

###################################################################