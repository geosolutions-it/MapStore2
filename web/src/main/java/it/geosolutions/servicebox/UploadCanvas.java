/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
package it.geosolutions.servicebox;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import sun.misc.BASE64Decoder;

//import sun.misc.IOUtils;

/**
 * Gets a HTML5 Canvas getDataURL output to save a png on a directory of the
 * server
 *
 * @author lorenzo
 */
public class UploadCanvas extends HttpServlet {

	private static final long serialVersionUID = -2477077719929697199L;

	private final static Logger LOGGER = Logger.getLogger(UploadCanvas.class.getSimpleName());

	private static final char COMMA = ',';

	private final static String PROPERTY_FILE_PARAM = "uploadcanvas.properties";

	private static String path = null;

	private Properties props;

	/**
	 * Initialize the <code>ProxyServlet</code>
	 *
	 * @param servletConfig
	 *            The Servlet configuration passed in by the servlet conatiner
	 */
	public void init(ServletConfig servletConfig) throws ServletException {
		super.init(servletConfig);

		String appPropertyFile = getServletContext().getInitParameter(PROPERTY_FILE_PARAM);
		InputStream inputStream = UploadCanvas.class.getResourceAsStream(appPropertyFile);

		Properties props = new Properties();
		
		try {
			props.load(inputStream);
			this.props = props;
		} catch (IOException e) {
			if (LOGGER.isLoggable(Level.SEVERE))
				LOGGER.log(Level.SEVERE,
						"Error encountered while processing properties file", e);
		} catch (NullPointerException e) {
			if (LOGGER.isLoggable(Level.SEVERE))
				LOGGER.log(Level.SEVERE,
						"Error encountered while processing properties file", e);
		} finally {
			
			try {
				if (inputStream != null){
					inputStream.close();
				}
				if(this.props == null){
					if (LOGGER.isLoggable(Level.WARNING)){
						LOGGER.log(Level.WARNING,
								"unable to find configuration for uploadCanvas. Using default temp directory: " + System.getProperty( "java.io.tmpdir"));
					}
				}
				
			} catch (IOException e) {
				if (LOGGER.isLoggable(Level.SEVERE))
					LOGGER.log(Level.SEVERE,
							"Error building the upload canvas configuration ", e);
				throw new ServletException(e.getMessage());
			}
		}
	}
	

	/**
	 * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
	 * methods.
	 *
	 * @param request
	 *            servlet request
	 * @param response
	 *            servlet response
	 * @throws ServletException
	 *             if a servlet-specific error occurs
	 * @throws IOException
	 *             if an I/O error occurs
	 */
	protected void processRequest(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		//String ip = request.getRemoteAddr();

		// get raw request data
		InputStream body = new BufferedInputStream(request.getInputStream());
		String id = java.util.UUID.randomUUID().toString();

		File f = File.createTempFile(id, ".png", this.props != null && this.props.getProperty("temp") != null ? new File(this.props.getProperty("temp")) : null);
		if (path == null) {
			path = f.getParent();
		}
		FileOutputStream fos = new FileOutputStream(f);
		PrintWriter out = response.getWriter();
		//System.out.println(f.getAbsoluteFile());

		char c = 'd';
		// read initials data, tipically "data:image/png;base64,"
		try {
			while (c != COMMA) {
				c = (char) body.read();
			}
			// decose base64 data
			BASE64Decoder decoder = new BASE64Decoder();
			byte[] decodedBytes = decoder.decodeBuffer(body);

			// response

			// write png data
			fos.write(decodedBytes);
			out.print(f.getName());

		} finally {
			try {
				if (fos != null) {

					fos.close();
				}
			} catch (Exception e) {
				LOGGER.severe(e.getStackTrace().toString());
			}
			try {
				if (out != null) {

					out.close();
				}
			} catch (Exception e) {
				LOGGER.severe(e.getStackTrace().toString());
			}
			try {
				if (body != null) {

					body.close();
				}
			} catch (Exception e) {
				LOGGER.severe(e.getStackTrace().toString());
			}
			try {
				if (out != null) {

					out.close();
				}
			} catch (Exception e) {
				LOGGER.severe(e.getStackTrace().toString());
			}
		}
	}

	// <editor-fold defaultstate="collapsed"
	// desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
	/**
	 * Handles the HTTP <code>GET</code> method.
	 *
	 * @param request
	 *            servlet request
	 * @param response
	 *            servlet response
	 * @throws ServletException
	 *             if a servlet-specific error occurs
	 * @throws IOException
	 *             if an I/O error occurs
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		OutputStream out = response.getOutputStream();
		String filename = request.getParameter("ID");
		String fn = request.getParameter("fn");

		if (fn == null || fn.equals("")) {
			fn = "image.png";
		}

		File f = null;
		InputStream in = null;
		BufferedInputStream bin = null;

		try {
			f = new File(path + "/" + filename);
			//System.out.println(f.getAbsoluteFile());
			in = new FileInputStream(f);

			bin = new BufferedInputStream(in);

			f.length();
			response.setHeader("Content-Description", "File Transfer");

			response.setContentLength((int) f.length());
			response.setHeader("Content-Transfer-Encoding", "binary");
			response.setHeader("Content-Disposition", "attachment; filename=\""
					+ fn + "\"");// fileName);

			// Copy the contents of the file to the output stream
			byte[] buf = new byte[1024];
			int count;
			while ((count = bin.read(buf)) >= 0) {
				out.write(buf, 0, count);
			}
			out.flush();

		} catch (FileNotFoundException e) {
			LOGGER.info(e.getMessage());
		} catch (IOException e) {
			LOGGER.info(e.getMessage());
			response.getWriter()
					.print("<html><head></head><body><h3>Sorry. We was unable to process your request. </h3></body</html>");
		} catch (Exception e){
			LOGGER.warning(e.getLocalizedMessage());
			throw new ServletException(e);
		}finally {
			if (out != null) {
				try {
					out.close();
				} catch (Exception e) {
					LOGGER.warning(e.getLocalizedMessage());
				}
			}
			if (in != null) {
				try {
					in.close();
				} catch (Exception e) {
					LOGGER.warning(e.getLocalizedMessage());
				}
			}
			if (bin != null) {
				try {
					bin.close();
				} catch (Exception e) {
					LOGGER.warning(e.getLocalizedMessage());
				}
			}

			try {
				f.delete();
			} catch (Exception e) {
				LOGGER.warning(e.getLocalizedMessage());
			}
		}
	}

	/**
	 * Handles the HTTP <code>POST</code> method.
	 *
	 * @param request
	 *            servlet request
	 * @param response
	 *            servlet response
	 * @throws ServletException
	 *             if a servlet-specific error occurs
	 * @throws IOException
	 *             if an I/O error occurs
	 */
	@Override
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		processRequest(request, response);
	}

	/**
	 * Returns a short description of the servlet.
	 *
	 * @return a String containing servlet description
	 */
	@Override
	public String getServletInfo() {
		return "Save a canvas as png";
	}// </editor-fold>
}
