package com.apsol.api.controller.api;

import java.io.IOException;
import java.net.URLEncoder;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import com.apsol.api.controller.model.JsonResultApi;
import com.apsol.api.entity.Photo;
import com.apsol.api.entity.QPhoto;
import com.apsol.api.exception.AuthorizeException;
import com.apsol.api.repository.PhotoRepository;
import com.querydsl.jpa.impl.JPAQueryFactory;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping(value = "api/fileData")
@CrossOrigin
@Slf4j
public class FileDataController extends AbstractApiController {

	@Autowired
	private JPAQueryFactory queryFactory;

	@RequestMapping(value = "download", method = RequestMethod.GET)
	@ResponseBody
	public JsonResultApi download(HttpServletResponse response, HttpServletRequest request,
			@RequestParam(value = "username", required = false) String username,
			@RequestParam Map<String, Object> params) throws AuthorizeException {
		JsonResultApi result = new JsonResultApi(-999) {
		};

		// accessForMember(request);

		long code = Long.parseLong((String) params.get("code"));

		QPhoto table = QPhoto.photo;
		Photo entity = queryFactory.select(table).from(table).where(table.code.eq(code)).fetchOne();

		try {
			outputFile(entity.getName(), entity.getBytes(), response, request);
		} catch (IOException e) {
			e.printStackTrace();

		}

		result.setId(0);
		return result;
	}

	private void outputFile(String fileName, byte[] bytes, HttpServletResponse response, HttpServletRequest request)
			throws IOException {

		String header = request.getHeader("User-Agent");

		response.setContentType("image/png");

		response.setHeader("Content-Transfer-Encoding", "binary");

		if (header.contains("MSIE") || header.contains("Trident")) {
			fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
			response.setHeader("Content-Disposition", "attachment;filename=\"" + fileName);
			response.setCharacterEncoding("UTF-8");
		} else {
			fileName = new String(fileName.getBytes("UTF-8"), "ISO-8859-1");
			response.setCharacterEncoding("ISO-8859-1");
			response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName);
		}

		fileName = URLEncoder.encode(fileName, "UTF-8").replaceAll("\\+", "%20");
		response.setHeader("Content-Disposition", "attachment;filename=\"" + fileName);
		response.setCharacterEncoding("UTF-8");

		response.setHeader("Cache-Control", "max-age=0");

		response.getOutputStream().write(bytes);
		response.getOutputStream().flush();
		response.getOutputStream().close();

	}

	@Autowired
	private PhotoRepository repository;

	@RequestMapping(value = "upload", method = { RequestMethod.POST })
	@ResponseBody
	public JsonResultApi upload(HttpServletResponse response,
			@RequestParam(value = "username", required = true) String username,
			@RequestParam("file[]") MultipartFile[] files, @AuthenticationPrincipal User user) throws IOException {

		JsonResultApi result = new JsonResultApi(-999) {
		};
		setHeader(response, "POST", "json");

		if (files == null) {
			result.setResult("파일이 정상적으로 업로드 되지 않았습니다.");
			return result;
		}
		for (MultipartFile file : files) {
			Photo entity = new Photo();
			entity.setName(file.getOriginalFilename());
			entity.setBytes(file.getBytes());
			entity.setContentType(file.getContentType());

			entity = repository.save(entity);

			result.setId((int) entity.getCode());
		}
		return result;
	}
}
