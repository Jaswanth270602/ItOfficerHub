package com.itofficerhub.util;

import com.itofficerhub.entity.Topic;
import java.util.List;
import java.util.Optional;

/**
 * Static IndiaBIX-style syllabus tree for IBPS SO IT Officer professional knowledge.
 * One practice question slot per subtopic (filled via admin JSON import).
 */
public final class PracticeCatalog {

	private PracticeCatalog() {}

	public record SubtopicDef(String slug, String title) {}

	public record SectionDef(String id, String title, Topic topic, String description, List<SubtopicDef> subtopics) {}

	public static final List<SectionDef> SECTIONS = List.of(
			new SectionDef("networking", "Computer Networks", Topic.NETWORKING,
					"OSI/TCP-IP, addressing, routing, DNS, firewalls — core IBPS IT Officer syllabus.",
					List.of(
							new SubtopicDef("osi-tcp-ip", "OSI & TCP/IP Model"),
							new SubtopicDef("ip-addressing", "IP Addressing & Subnetting"),
							new SubtopicDef("routing-switching", "Routing & Switching"),
							new SubtopicDef("dns-dhcp", "DNS & DHCP"),
							new SubtopicDef("firewalls-nat", "Firewalls & NAT"),
							new SubtopicDef("network-protocols", "Common Network Protocols"))),
			new SectionDef("dbms", "DBMS & SQL", Topic.DBMS,
					"Normalization, SQL, transactions, indexing — high-weight in PSU & IBPS IT papers.",
					List.of(
							new SubtopicDef("normalization", "Normalization (1NF–3NF)"),
							new SubtopicDef("sql-queries", "SQL Queries & Joins"),
							new SubtopicDef("indexing", "Indexing & Query Plans"),
							new SubtopicDef("transactions-acid", "Transactions & ACID"),
							new SubtopicDef("er-modeling", "ER Diagrams & Keys"),
							new SubtopicDef("nosql-basics", "NoSQL Basics"))),
			new SectionDef("operating-systems", "Operating Systems", Topic.OPERATING_SYSTEMS,
					"Processes, scheduling, memory, deadlocks — frequent IT Officer traps.",
					List.of(
							new SubtopicDef("process-threads", "Processes & Threads"),
							new SubtopicDef("cpu-scheduling", "CPU Scheduling"),
							new SubtopicDef("deadlocks", "Deadlocks & Prevention"),
							new SubtopicDef("memory-management", "Memory Management"),
							new SubtopicDef("file-systems", "File Systems"))),
			new SectionDef("security", "Cyber Security", Topic.SECURITY,
					"Encryption, malware, secure coding — growing share in recent papers.",
					List.of(
							new SubtopicDef("encryption-basics", "Encryption & Hashing"),
							new SubtopicDef("malware-attacks", "Malware & Attack Types"),
							new SubtopicDef("authentication", "Authentication & Authorization"),
							new SubtopicDef("owasp-basics", "OWASP & Secure Coding"),
							new SubtopicDef("network-security", "Network Security Controls"))),
			new SectionDef("web-technologies", "Web Technologies", Topic.WEB_TECHNOLOGIES,
					"HTTP, REST, front-end basics, web servers.",
					List.of(
							new SubtopicDef("http-rest", "HTTP & REST APIs"),
							new SubtopicDef("html-css-js", "HTML, CSS & JavaScript"),
							new SubtopicDef("web-servers", "Web Servers & Middleware"),
							new SubtopicDef("cookies-sessions", "Cookies, Sessions & JWT"))),
			new SectionDef("data-structures", "Data Structures", Topic.DATA_STRUCTURES,
					"Arrays, trees, graphs, complexity — fundamentals for IT aptitude.",
					List.of(
							new SubtopicDef("arrays-stacks-queues", "Arrays, Stacks & Queues"),
							new SubtopicDef("linked-lists", "Linked Lists"),
							new SubtopicDef("trees-graphs", "Trees & Graphs"),
							new SubtopicDef("sorting-searching", "Sorting & Searching"),
							new SubtopicDef("complexity", "Time & Space Complexity"))),
			new SectionDef("computer-organization", "Computer Organization", Topic.COMPUTER_ORGANIZATION,
					"CPU, cache, I/O, instruction cycles.",
					List.of(
							new SubtopicDef("cpu-registers", "CPU & Registers"),
							new SubtopicDef("cache-memory", "Cache & Main Memory"),
							new SubtopicDef("io-systems", "I/O Systems"),
							new SubtopicDef("instruction-cycle", "Instruction Cycle & Pipelining"))),
			new SectionDef("software-engineering", "Software Engineering", Topic.SOFTWARE_ENGINEERING,
					"SDLC, testing, Agile, UML — often 2–4 questions per mock.",
					List.of(
							new SubtopicDef("sdlc-models", "SDLC & Process Models"),
							new SubtopicDef("testing-types", "Testing Types & Levels"),
							new SubtopicDef("agile-scrum", "Agile & Scrum"),
							new SubtopicDef("uml-basics", "UML Diagrams"))),
			new SectionDef("cloud-digital", "Cloud & Digital", Topic.CLOUD_COMPUTING,
					"Cloud service models, virtualization, digital electronics basics.",
					List.of(
							new SubtopicDef("iaas-paas-saas", "IaaS, PaaS & SaaS"),
							new SubtopicDef("virtualization", "Virtualization & Containers"),
							new SubtopicDef("boolean-algebra", "Boolean Algebra & Gates"),
							new SubtopicDef("number-systems", "Number Systems & Conversions"))));

	public static Optional<SectionDef> section(String sectionId) {
		return SECTIONS.stream().filter(s -> s.id().equals(sectionId)).findFirst();
	}

	public static Optional<SubtopicDef> subtopic(String sectionId, String slug) {
		return section(sectionId).flatMap(s -> s.subtopics().stream().filter(t -> t.slug().equals(slug)).findFirst());
	}

	public static boolean isValidSlot(String sectionId, String subtopicSlug) {
		return subtopic(sectionId, subtopicSlug).isPresent();
	}
}
