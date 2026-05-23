package com.itofficerhub.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "questions")
public class Question {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "mock_test_id", nullable = false)
	private MockTest mockTest;

	@Column(nullable = false, length = 4000)
	private String questionText;

	@Column(nullable = false, length = 1000)
	private String optionA;

	@Column(nullable = false, length = 1000)
	private String optionB;

	@Column(nullable = false, length = 1000)
	private String optionC;

	@Column(nullable = false, length = 1000)
	private String optionD;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private OptionLabel correctOption;

	@Column(length = 4000)
	private String explanation;

	@Column(length = 2000)
	private String solutionImageUrl;

	@Enumerated(EnumType.STRING)
	private Topic topic;

	@Column(nullable = false)
	private int orderIndex;

	/** Fine-grained tag from import (e.g. Deadlock, TCP/IP) for result analytics. */
	@Column(name = "topic_tag", length = 128)
	private String topicTag;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public MockTest getMockTest() { return mockTest; }
	public void setMockTest(MockTest mockTest) { this.mockTest = mockTest; }
	public String getQuestionText() { return questionText; }
	public void setQuestionText(String questionText) { this.questionText = questionText; }
	public String getOptionA() { return optionA; }
	public void setOptionA(String optionA) { this.optionA = optionA; }
	public String getOptionB() { return optionB; }
	public void setOptionB(String optionB) { this.optionB = optionB; }
	public String getOptionC() { return optionC; }
	public void setOptionC(String optionC) { this.optionC = optionC; }
	public String getOptionD() { return optionD; }
	public void setOptionD(String optionD) { this.optionD = optionD; }
	public OptionLabel getCorrectOption() { return correctOption; }
	public void setCorrectOption(OptionLabel correctOption) { this.correctOption = correctOption; }
	public String getExplanation() { return explanation; }
	public void setExplanation(String explanation) { this.explanation = explanation; }
	public String getSolutionImageUrl() { return solutionImageUrl; }
	public void setSolutionImageUrl(String solutionImageUrl) { this.solutionImageUrl = solutionImageUrl; }
	public Topic getTopic() { return topic; }
	public void setTopic(Topic topic) { this.topic = topic; }
	public int getOrderIndex() { return orderIndex; }
	public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
	public String getTopicTag() { return topicTag; }
	public void setTopicTag(String topicTag) { this.topicTag = topicTag; }
}
